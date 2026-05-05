import { redirect } from "next/navigation";
import { and, desc, eq, gte, lte, count } from "drizzle-orm";
import { ToastOnLoad } from "@/components/toast-on-load";
import { TransactionTableWithModal } from "@/components/transactions/transaction-table-with-modal";
import { CategoryFilter } from "@/components/transactions/category-filter";
import { monthRange } from "@/lib/finance";
import { auth } from "@/lib/auth";
import { db, transactions } from "@/lib/db";
import { currentMonth, normalizeDate } from "@/lib/utils";
import type { Transaction } from "@/lib/finance";

const PAGE_SIZE = 5;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { month?: string; category?: string; edit?: string; saved?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const month = searchParams.month ?? currentMonth();
  const category = searchParams.category ?? "all";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { from, to } = monthRange(month);

  const baseWhere = and(
    eq(transactions.userId, session.user.id),
    gte(transactions.date, from),
    lte(transactions.date, to),
    ...(category !== "all" ? [eq(transactions.category, category)] : [])
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(transactions)
    .where(baseWhere);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [rows, editRow] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(baseWhere)
      .orderBy(desc(transactions.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    searchParams.edit
      ? db
          .select()
          .from(transactions)
          .where(and(eq(transactions.id, searchParams.edit), eq(transactions.userId, session.user.id)))
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  const mapRow = (r: typeof rows[0]): Transaction => ({
    id: r.id,
    user_id: r.userId,
    date: normalizeDate(r.date),
    description: r.description,
    category: r.category,
    type: r.type as "income" | "expense",
    amount: Number(r.amount),
    created_at: r.createdAt.toISOString(),
  });

  const typedTransactions = rows.map(mapRow);
  const editTransaction = editRow ? mapRow(editRow) : undefined;

  const paginationUrls: Record<number, string> = {};
  for (let p = 1; p <= totalPages; p++) {
    const params = new URLSearchParams();
    params.set("month", month);
    if (category !== "all") params.set("category", category);
    params.set("page", String(p));
    paginationUrls[p] = `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {searchParams.saved && (
        <ToastOnLoad title="Transaksi tersimpan" description="Ringkasan bulanan Anda diperbarui." />
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Transaksi</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola semua pemasukan dan pengeluaran Anda.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Month picker — native form submit */}
          <form className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Periode</label>
              <input
                type="month"
                name="month"
                defaultValue={month}
                className="flex h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 sm:w-auto sm:shrink-0"
            >
              Terapkan
            </button>
          </form>
          {/* Category filter — client-side instant navigation */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Kategori</label>
            <CategoryFilter month={month} category={category} />
          </div>
        </div>
      </div>

      <TransactionTableWithModal
        transactions={typedTransactions}
        editTransaction={editTransaction}
        pagination={{ currentPage, totalPages, total, urls: paginationUrls }}
      />
    </div>
  );
}
