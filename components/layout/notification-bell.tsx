import { auth } from "@/lib/auth";
import { db, budgets, transactions } from "@/lib/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { monthRange } from "@/lib/finance";
import { currentMonth, formatCurrency } from "@/lib/utils";
import { NotificationBellClient, type NotificationType } from "./notification-bell-client";

export async function NotificationBell() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const month = currentMonth();
  const { from, to } = monthRange(month);

  // Ambil semua anggaran pengguna
  const userBudgets = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, session.user.id));

  if (userBudgets.length === 0) {
    return <NotificationBellClient notifications={[]} />;
  }

  // Ambil semua pengeluaran bulan ini
  const expenses = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, "expense"),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    );

  // Hitung total pengeluaran per kategori
  const spentByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const notifications: NotificationType[] = [];

  for (const budget of userBudgets) {
    const limit = Number(budget.monthlyLimit);
    const spent = spentByCategory[budget.category] || 0;
    
    if (limit <= 0) continue; // hindari pembagian nol
    
    const percentage = (spent / limit) * 100;

    if (percentage >= 100) {
      notifications.push({
        id: budget.id + "-exceeded",
        title: "Anggaran Terlampaui!",
        message: `Pengeluaran ${budget.category} sudah melebihi batas (Maks: ${formatCurrency(limit)}).`,
        type: "danger",
      });
    } else if (percentage >= 80) {
      notifications.push({
        id: budget.id + "-warning",
        title: "Anggaran Menipis",
        message: `Pengeluaran ${budget.category} sudah mencapai ${Math.round(percentage)}% dari batas.`,
        type: "warning",
      });
    }
  }

  // Urutkan: bahaya (merah) di atas, peringatan (kuning) di bawah
  notifications.sort((a, b) => {
    if (a.type === "danger" && b.type === "warning") return -1;
    if (a.type === "warning" && b.type === "danger") return 1;
    return 0;
  });

  return <NotificationBellClient notifications={notifications} />;
}
