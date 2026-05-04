import { ToastOnLoad } from "@/components/toast-on-load";
import { TransactionTableWithModal } from "@/components/transactions/transaction-table-with-modal";
import { Select } from "@/components/ui/select";
import { categories, monthRange, Transaction } from "@/lib/finance";
import { createClient } from "@/lib/supabase/server";
import { currentMonth } from "@/lib/utils";

const PAGE_SIZE = 5;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { month?: string; category?: string; edit?: string; saved?: string; page?: string };
}) {
  const month = searchParams.month ?? currentMonth();
  const category = searchParams.category ?? "all";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { from, to } = monthRange(month);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Count total for pagination
  let countQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("date", from)
    .lte("date", to);

  if (category !== "all") countQuery = countQuery.eq("category", category);

  const { count: totalCount } = await countQuery;
  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch paginated data
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .gte("date", from)
    .lte("date", to)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (category !== "all") query = query.eq("category", category);

  const [{ data: transactions = [] }, { data: editTransaction }] = await Promise.all([
    query,
    searchParams.edit
      ? supabase.from("transactions").select("*").eq("user_id", user!.id).eq("id", searchParams.edit).single()
      : Promise.resolve({ data: null }),
  ]);

  const typedTransactions = transactions as Transaction[];

  // Pre-compute pagination URLs on server
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
      {searchParams.saved && <ToastOnLoad title="Transaksi tersimpan" description="Ringkasan bulanan Anda diperbarui." />}

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Transaksi</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola semua pemasukan dan pengeluaran Anda.</p>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Periode</label>
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Kategori</label>
            <Select name="category" defaultValue={category}>
              <option value="all">Semua kategori</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 sm:w-auto"
          >
            Terapkan
          </button>
        </form>
      </div>

      {/* Transaction table with add/edit modal */}
      <TransactionTableWithModal
        transactions={typedTransactions}
        editTransaction={(editTransaction as Transaction | null) ?? undefined}
        pagination={{
          currentPage,
          totalPages,
          total,
          urls: paginationUrls,
        }}
      />
    </div>
  );
}
