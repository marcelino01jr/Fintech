import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";

export const categories = [
  "Gaji",
  "Freelance",
  "Makanan & Minuman",
  "Transportasi",
  "Tagihan",
  "Belanja",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Lainnya"
];

export type Transaction = {
  id: string;
  user_id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  currency?: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
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

export function yearRange(year: string) {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`
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

export function monthlyCashflowByYear(transactions: Transaction[]) {
  const months = new Map<string, { month: string; income: number; expense: number }>();
  
  for (let i = 1; i <= 12; i++) {
    const mm = String(i).padStart(2, "0");
    months.set(mm, { month: mm, income: 0, expense: 0 });
  }

  transactions.forEach((transaction) => {
    const mm = transaction.date.slice(5, 7);
    const item = months.get(mm);
    if (item) {
      item[transaction.type] += Number(transaction.amount);
    }
  });

  // Map "01" to "Jan", "02" to "Feb", etc. for display
  const monthLabels: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "Mei", "06": "Jun", "07": "Jul", "08": "Agt",
    "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des"
  };

  return Array.from(months.values()).map(m => ({
    ...m,
    label: monthLabels[m.month] || m.month
  }));
}
