import { auth } from "@/lib/auth";
import { db, transactions } from "@/lib/db";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { normalizeDate } from "@/lib/utils";
import { monthRange } from "@/lib/finance";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");

  const conditions = [eq(transactions.userId, session.user.id)];

  if (month) {
    const { from, to } = monthRange(month);
    conditions.push(gte(transactions.date, from), lte(transactions.date, to));
  }

  if (category && category !== "all") {
    conditions.push(eq(transactions.category, category));
  }

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

  // Build CSV Header dengan UTF-8 BOM agar Excel membacanya dengan rapi
  let csv = "\uFEFF";
  csv += "Tanggal;Deskripsi;Kategori;Tipe;Jumlah;Mata Uang\n";

  // Build CSV Rows
  userTransactions.forEach((t) => {
    const date = normalizeDate(t.date);
    // Escape quotes in description and wrap in quotes to handle semicolons
    const description = `"${t.description.replace(/"/g, '""')}"`;
    const cat = `"${t.category}"`;
    const type = t.type === "income" ? "Pemasukan" : "Pengeluaran";
    const amount = t.amount;
    const currency = t.currency || "IDR";

    csv += `${date};${description};${cat};${type};${amount};${currency}\n`;
  });

  const filename = month ? `transaksi_${month}.csv` : "semua_transaksi.csv";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
