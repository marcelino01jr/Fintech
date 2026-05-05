"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveTransaction } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { incomeCategories, expenseCategories, allCategories, Transaction } from "@/lib/finance";

export function TransactionForm({
  transaction,
  hideCard,
}: {
  transaction?: Transaction;
  hideCard?: boolean;
}) {
  const [type, setType] = useState<"income" | "expense">(transaction?.type ?? "expense");

  const categoryList = type === "income" ? incomeCategories : expenseCategories;

  const initialCategory = useMemo(() => {
    if (!transaction?.category) return categoryList[0];
    return allCategories.includes(transaction.category as never)
      ? transaction.category
      : "Lainnya";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.category]);

  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState(
    transaction?.category && !allCategories.includes(transaction.category as never)
      ? transaction.category
      : ""
  );

  // Reset category when type changes, pick first in new list
  function handleTypeChange(newType: "income" | "expense") {
    setType(newType);
    const newList = newType === "income" ? incomeCategories : expenseCategories;
    setCategory(newList[0]);
    setCustomCategory("");
  }

  const form = (
    <form action={saveTransaction} className="space-y-4">
      <input type="hidden" name="id" defaultValue={transaction?.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={transaction?.date ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Jenis</Label>
          <Select
            id="type"
            name="type"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as "income" | "expense")}
            required
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">
            Kategori
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              type === "income"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}>
              {type === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          </Label>
          <Select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categoryList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          {category === "Lainnya" && (
            <Input
              name="custom_category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Nama kategori kustom"
              className="mt-2"
              required
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Jumlah</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="any"
            defaultValue={transaction?.amount}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi</Label>
        <Input
          id="description"
          name="description"
          defaultValue={transaction?.description}
          placeholder="Contoh: Makan siang, gaji bulanan..."
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        <SubmitButton>{transaction ? "Perbarui" : "Tambah Transaksi"}</SubmitButton>
        {transaction && (
          <Button asChild variant="outline">
            <Link href="/transactions">Batal</Link>
          </Button>
        )}
      </div>
    </form>
  );

  if (hideCard) return form;

  return (
    <Card id="transaction-form">
      <CardHeader>
        <CardTitle>{transaction ? "Edit Transaksi" : "Tambah Transaksi"}</CardTitle>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
