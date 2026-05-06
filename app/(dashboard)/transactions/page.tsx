import { redirect } from "next/navigation";
import { and, desc, eq, gte, lte, count } from "drizzle-orm";
import { ToastOnLoad } from "@/components/toast-on-load";
import { TransactionTableWithModal } from "@/components/transactions/transaction-table-with-modal";
import { CategoryFilter } from "@/components/transactions/category-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { monthRange } from "@/lib/finance";
import { auth } from "@/lib/auth";
import { db, transactions, users } from "@/lib/db";
import { currentMonth, normalizeDate } from "@/lib/utils";
import { type CurrencyCode, isValidCurrency } from "@/lib/currency";
import type { Transaction } from "@/lib/finance";

const PAGE_SIZE = 5;

export default async function TransactionsPage({
  searchParams,
}: Readonly<{
  searchParams: { month?: string; category?: string; edit?: string; saved?: string; page?: string };
}>) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db.select({ currency: users.currency }).from(users).where(eq(users.id, session.user.id)).limit(1);
  const userCurrency: CurrencyCode = (user?.currency && isValidCurrency(user.currency)) ? user.currency as CurrencyCode : "IDR";

  const month = searchParams.month ?? currentMonth();
  const category = searchParams.category ?? "all";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { from, to } = monthRange(month);

  const baseWhere = and(
    eq(transactions.userId, session.user.id),
    gte(transactions.date, from),
    lte(transactions.date, to),
    ...(category === "all" ? [] : [eq(transactions.category, category)])
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
    type: r.type,
    amount: Number(r.amount),
    currency: r.currency ?? "IDR",
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

      <Card>
        <CardHeader className="gap-2 bg-slate-50/80 px-5 py-4">
          <div className="space-y-1">
            <CardTitle>Filter Transaksi</CardTitle>
            <CardDescription>Pilih periode dan kategori untuk menampilkan transaksi yang sesuai.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5 pt-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="month" className="text-xs font-medium text-slate-500">Periode</label>
            <Input id="month" type="month" name="month" defaultValue={month} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-medium text-slate-500">Kategori</label>
            <CategoryFilter id="category" month={month} category={category} />
          </div>
          <div className="flex items-end justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Terapkan
            </Button>
          </div>
        </CardContent>
      </Card>

      <TransactionTableWithModal
        transactions={typedTransactions}
        editTransaction={editTransaction}
        pagination={{ currentPage, totalPages, total, urls: paginationUrls }}
        userCurrency={userCurrency}
      />
    </div>
  );
}
