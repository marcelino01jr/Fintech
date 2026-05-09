import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { DailyCashflowChart } from "@/components/charts/daily-expense-chart";
import { YearlyCashflowChart } from "@/components/charts/yearly-cashflow-chart";
import { MonthFilter } from "@/components/month-filter";
import { YearFilter } from "@/components/year-filter";
import { ViewToggle } from "@/components/view-toggle";
import { SummaryCard } from "@/components/summary-card";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { cashflowByDay, dailyCashflow, expensesByCategory, monthRange, yearRange, summarize, monthlyCashflowByYear } from "@/lib/finance";
import { auth } from "@/lib/auth";
import { db, transactions, users } from "@/lib/db";
import { currentMonth, normalizeDate } from "@/lib/utils";
import { CircleDollarSign, Plus } from "lucide-react";
import { type CurrencyCode, isValidCurrency } from "@/lib/currency";
import type { Transaction } from "@/lib/finance";

export default async function DashboardPage({ searchParams }: { searchParams: { month?: string; view?: string; year?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch user's preferred currency
  const [user] = await db.select({ currency: users.currency }).from(users).where(eq(users.id, session.user.id)).limit(1);
  const userCurrency: CurrencyCode = (user?.currency && isValidCurrency(user.currency)) ? user.currency as CurrencyCode : "IDR";

  const view = searchParams.view === "yearly" ? "yearly" : "monthly";
  const month = searchParams.month ?? currentMonth();
  const year = searchParams.year ?? new Date().getFullYear().toString();
  
  const { from, to } = view === "yearly" ? yearRange(year) : monthRange(month);

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
    date: normalizeDate(r.date),
    description: r.description,
    category: r.category,
    type: r.type as "income" | "expense",
    amount: Number(r.amount),
    currency: r.currency ?? "IDR",
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
  
  const emptyStateLabel = view === "yearly" ? `Tahun ${year}` : monthLabel;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Dashboard</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {greeting}, {displayName}
            </h1>

          </div>
          <Suspense fallback={<div className="h-[38px] w-[120px] rounded-2xl bg-slate-100 animate-pulse" />}>
            <ViewToggle />
          </Suspense>
        </div>
        <Suspense fallback={<div className="mt-5 h-[44px] w-[200px] rounded-2xl bg-slate-100 animate-pulse" />}>
          {view === "yearly" ? <YearFilter year={year} /> : <MonthFilter month={month} />}
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <SummaryCard label="Total Pemasukan" value={summary.income} tone="income" currency={userCurrency} />
        <SummaryCard label="Total Pengeluaran" value={summary.expense} tone="expense" currency={userCurrency} />
        <SummaryCard label="Saldo" value={summary.balance} tone="balance" currency={userCurrency} />
      </div>

      {typedTransactions.length ? (
        <>
          {view === "yearly" ? (
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <YearlyCashflowChart data={monthlyCashflowByYear(typedTransactions)} currency={userCurrency} />
              <CategoryPieChart data={expensesByCategory(typedTransactions)} currency={userCurrency} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CashflowChart data={cashflowByDay(typedTransactions)} currency={userCurrency} />
              <CategoryPieChart data={expensesByCategory(typedTransactions)} currency={userCurrency} />
              <DailyCashflowChart data={dailyCashflow(typedTransactions)} currency={userCurrency} />
            </div>
          )}
          <TransactionTable transactions={recent} showTitle />
        </>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center sm:rounded-3xl sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <CircleDollarSign className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Belum ada transaksi di {emptyStateLabel}
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
              {view === "monthly" && isCurrentMonth
                ? "Mulai catat pemasukan dan pengeluaran bulan ini untuk melihat ringkasan, chart, dan insight."
                : `Tidak ada data untuk ${emptyStateLabel}. Gunakan filter di atas untuk melihat periode lain.`}
            </p>
          </div>
          {view === "monthly" && isCurrentMonth && (
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
