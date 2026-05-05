import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";

export type CategoryType = "income" | "expense";

export const incomeCategories = [
  "Gaji",
  "Freelance",
  "Investasi",
  "Bonus",
  "Hadiah",
  "Penjualan",
  "Lainnya",
] as const;

export const expenseCategories = [
  "Makanan & Minuman",
  "Transportasi",
  "Tagihan",
  "Belanja",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Perawatan Pribadi",
  "Rumah Tangga",
  "Lainnya",
] as const;

/** Gabungan semua kategori — dipakai untuk filter & backward-compat */
export const allCategories = [...incomeCategories, ...expenseCategories];

/** @deprecated gunakan incomeCategories / expenseCategories */
export const categories = allCategories;

export type Transaction = {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number | string;
  created_at: string | Date;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number | string;
};

export type Account = {
  id: string;
  user_id: string;
  name: string;
  balance: number;
};

export function monthRange(month: string) {
  const date = parseISO(`${month}-01`);
  return {
    from: format(startOfMonth(date), "yyyy-MM-dd"),
    to: format(endOfMonth(date), "yyyy-MM-dd")
  };
}

export function summarize(transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return { income, expense, balance: income - expense };
}

export function cashflowByDay(transactions: Transaction[]) {
  const days = new Map<string, { date: string; income: number; expense: number; balance: number }>();

  transactions.forEach((transaction) => {
    const item = days.get(transaction.date) ?? {
      date: transaction.date.slice(5),
      income: 0,
      expense: 0,
      balance: 0
    };
    item[transaction.type] += Number(transaction.amount);
    item.balance = item.income - item.expense;
    days.set(transaction.date, item);
  });

  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function expensesByCategory(transactions: Transaction[]) {
  const categoriesByTotal = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      categoriesByTotal.set(
        transaction.category,
        (categoriesByTotal.get(transaction.category) ?? 0) + Number(transaction.amount)
      );
    });

  return Array.from(categoriesByTotal.entries()).map(([name, value]) => ({ name, value }));
}

export function dailyExpenses(transactions: Transaction[]) {
  const days = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      days.set(transaction.date, (days.get(transaction.date) ?? 0) + Number(transaction.amount));
    });

  return Array.from(days.entries())
    .map(([date, expense]) => ({ date: date.slice(5), expense }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function dailyCashflow(transactions: Transaction[]) {
  const days = new Map<string, { date: string; income: number; expense: number }>();

  transactions.forEach((transaction) => {
    const item = days.get(transaction.date) ?? {
      date: transaction.date.slice(5),
      income: 0,
      expense: 0
    };
    item[transaction.type] += Number(transaction.amount);
    days.set(transaction.date, item);
  });

  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}
