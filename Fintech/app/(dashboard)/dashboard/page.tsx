import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { DailyCashflowChart } from "@/components/charts/daily-expense-chart";
import { MonthFilter } from "@/components/month-filter";
import { SummaryCard } from "@/components/summary-card";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { cashflowByDay, dailyCashflow, expensesByCategory, monthRange, summarize } from "@/lib/finance";
import { auth } from "@/lib/auth";
import { db, transactions } from "@/lib/db";
import { currentMonth } from "@/lib/utils";
import { CircleDollarSign, Plus } from "lucide-react";
import type { Transaction } from "@/lib/finance";

export default async function DashboardPage({ searchParams }: { searchParams: { month?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const month = searchParams.month ?? currentMonth();
  const { from, to } = monthRange(month);

  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )
    .orderBy(asc(transactions.date));

  const typedTransactions: Transaction[] = rows.map((r) => ({
    id: r.id,
    user_id: r.userId,
    date: r.date,
    description: r.description,
    category: r.category,
    type: r.type as "income" | "expense",
    amount: Number(r.amount),
    created_at: r.createdAt.toISOString(),
  }));

  const summary = summarize(typedTransactions);
  const recent = [...typedTransactions].reverse().slice(0, 5);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  const displayName = session.user.name ?? (() => {
    const rawName = session.user.email?.split("@")[0] ?? "Teman";
    return rawName
      .replace(/[._\-]/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word: string) => word[0]?.toUpperCase() + word.slice(1))
      .join(" ");
  })();

  const isCurrentMonth = month === currentMonth();
  const [y, m] = month.split("-");
  const monthLabel = new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Hero / Greeting Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {greeting}, {displayName}
            </h1>

          </div>
        </div>
        <MonthFilter month={month} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <SummaryCard label="Total Pemasukan" value={summary.income} tone="income" />
        <SummaryCard label="Total Pengeluaran" value={summary.expense} tone="expense" />
        <SummaryCard label="Saldo" value={summary.balance} tone="balance" />
      </div>

      {/* Charts & Recent Transactions */}
      {typedTransactions.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CashflowChart data={cashflowByDay(typedTransactions)} />
            <CategoryPieChart data={expensesByCategory(typedTransactions)} />
            <DailyCashflowChart data={dailyCashflow(typedTransactions)} />
          </div>
          <TransactionTable transactions={recent} showTitle />
        </>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center sm:rounded-3xl sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <CircleDollarSign className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Belum ada transaksi di {monthLabel}
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
              {isCurrentMonth
                ? "Mulai catat pemasukan dan pengeluaran bulan ini untuk melihat ringkasan, chart, dan insight."
                : `Tidak ada data untuk ${monthLabel}. Gunakan filter di atas untuk melihat bulan lain.`}
            </p>
          </div>
          {isCurrentMonth && (
            <Link
              href="/transactions"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
