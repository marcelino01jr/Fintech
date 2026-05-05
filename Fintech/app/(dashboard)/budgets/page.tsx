import { redirect } from "next/navigation";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { ToastOnLoad } from "@/components/toast-on-load";
import { BudgetSection } from "@/components/budgets/budget-section";
import { SummaryCard } from "@/components/summary-card";
import { monthRange } from "@/lib/finance";
import { auth } from "@/lib/auth";
import { db, transactions, budgets as budgetsTable } from "@/lib/db";
import { currentMonth } from "@/lib/utils";
import type { Budget, Transaction } from "@/lib/finance";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { saved?: string; month?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const month = searchParams.month ?? currentMonth();
  const { from, to } = monthRange(month);

  const [budgetRows, txRows] = await Promise.all([
    db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.userId, session.user.id))
      .orderBy(asc(budgetsTable.category)),
    db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          eq(transactions.type, "expense"),
          gte(transactions.date, from),
          lte(transactions.date, to)
        )
      ),
  ]);

  const budgetList: Budget[] = budgetRows.map((b) => ({
    id: b.id,
    user_id: b.userId,
    category: b.category,
    monthly_limit: Number(b.monthlyLimit),
  }));

  const txList: Transaction[] = txRows.map((r) => ({
    id: r.id,
    user_id: r.userId,
    date: r.date,
    description: r.description,
    category: r.category,
    type: r.type as "income" | "expense",
    amount: Number(r.amount),
    created_at: r.createdAt.toISOString(),
  }));

  // Build spending map — case-insensitive matching
  const spendingRaw = txList.reduce<Record<string, number>>((acc, t) => {
    const key = t.category.toLowerCase();
    acc[key] = (acc[key] ?? 0) + Number(t.amount);
    return acc;
  }, {});

  const spending: Record<string, number> = {};
  for (const budget of budgetList) {
    spending[budget.category] = spendingRaw[budget.category.toLowerCase()] ?? 0;
  }

  const totalLimit = budgetList.reduce((s, b) => s + Number(b.monthly_limit), 0);
  const totalSpent = Object.values(spending).reduce((s, v) => s + v, 0);

  const sortedBudgets = [...budgetList].sort((a, b) => {
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
        <SummaryCard label="Jumlah Anggaran" value={budgetList.length} tone="balance" />
        <SummaryCard label="Total Batas" value={totalLimit} tone="income" />
        <SummaryCard label="Total Terpakai" value={totalSpent} tone="expense" />
      </div>

      {/* Budget section */}
      <BudgetSection budgets={sortedBudgets} spending={spending} />
    </div>
  );
}
