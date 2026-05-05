import { ToastOnLoad } from "@/components/toast-on-load";
import { BudgetSection } from "@/components/budgets/budget-section";
import { SummaryCard } from "@/components/summary-card";
import { Budget, monthRange, Transaction } from "@/lib/finance";
import { db } from "@/lib/db";
import { transactions as transactionsTable, budgets as budgetsTable } from "@/lib/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { currentMonth } from "@/lib/utils";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { saved?: string; month?: string };
}) {
  const month = searchParams.month ?? currentMonth();
  const { from, to } = monthRange(month);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [budgets, transactions] = await Promise.all([
    db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.user_id, user!.id))
      .orderBy(asc(budgetsTable.category)),
    db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, user!.id),
          eq(transactionsTable.type, "expense"),
          gte(transactionsTable.date, from),
          lte(transactionsTable.date, to)
        )
      ),
  ]);

  // Build spending map — case-insensitive matching
  const spendingRaw = (transactions as Transaction[]).reduce<Record<string, number>>((acc, t) => {
    const key = t.category.toLowerCase();
    acc[key] = (acc[key] ?? 0) + Number(t.amount);
    return acc;
  }, {});

  // Map spending back to budget category names for display
  const spending: Record<string, number> = {};
  for (const budget of budgets as Budget[]) {
    spending[budget.category] = spendingRaw[budget.category.toLowerCase()] ?? 0;
  }

  const totalLimit = (budgets as Budget[]).reduce((s, b) => s + Number(b.monthly_limit), 0);
  const totalSpent = Object.values(spending).reduce((s, v) => s + v, 0);

  // Sort budgets by progress percentage (highest first)
  const sortedBudgets = [...(budgets as Budget[])].sort((a, b) => {
    const pctA = Number(a.monthly_limit) > 0 ? (spending[a.category] ?? 0) / Number(a.monthly_limit) : 0;
    const pctB = Number(b.monthly_limit) > 0 ? (spending[b.category] ?? 0) / Number(b.monthly_limit) : 0;
    return pctB - pctA;
  });

  return (
    <div className="space-y-6">
      {searchParams.saved && <ToastOnLoad title="Anggaran tersimpan" description="Batas kategori Anda siap." />}

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Anggaran</h1>
        <p className="mt-1 text-sm text-slate-500">Tetapkan batas bulanan dan pantau pengeluaran per kategori.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryCard label="Jumlah Anggaran" value={(budgets as Budget[]).length} tone="balance" />
        <SummaryCard label="Total Batas" value={totalLimit} tone="income" />
        <SummaryCard label="Total Terpakai" value={totalSpent} tone="expense" />
      </div>

      {/* Budget section */}
      <BudgetSection budgets={sortedBudgets} spending={spending} />
    </div>
  );
}
