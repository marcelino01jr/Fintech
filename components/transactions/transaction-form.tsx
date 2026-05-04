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
import { categories, Transaction } from "@/lib/finance";

export function TransactionForm({
  transaction,
  hideCard,
}: {
  transaction?: Transaction;
  hideCard?: boolean;
}) {
  const initialCategory = useMemo(() => {
    if (!transaction?.category) return "Makanan";
    return categories.includes(transaction.category) ? transaction.category : "Lainnya";
  }, [transaction?.category]);

  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState(
    transaction?.category && !categories.includes(transaction.category) ? transaction.category : ""
  );

  const form = (
    <form action={saveTransaction} className="space-y-4">
      <input type="hidden" name="id" defaultValue={transaction?.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" name="date" type="date" defaultValue={transaction?.date ?? new Date().toISOString().slice(0, 10)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Jenis</Label>
          <Select id="type" name="type" defaultValue={transaction?.type ?? "expense"} required>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Kategori</Label>
          <Select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map((c) => (
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
          <Input id="amount" name="amount" type="number" min="0" step="any" defaultValue={transaction?.amount} placeholder="0" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi</Label>
        <Input id="description" name="description" defaultValue={transaction?.description} placeholder="Contoh: Makan siang, gaji bulanan..." required />
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
