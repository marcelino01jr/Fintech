"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Utensils, Car, Zap, ShoppingBag,
  Heart, Gamepad2, GraduationCap, MoreHorizontal, Briefcase, Laptop
} from "lucide-react";
import { saveTransaction } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/select";
import type { DropdownOption } from "@/components/ui/select";
import { categories, Transaction } from "@/lib/finance";
import { CURRENCY_CODES, SUPPORTED_CURRENCIES, getCurrencySymbol, type CurrencyCode } from "@/lib/currency";

// ─── Category icons & colors ─────────────────────────────────────────────────

const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  "Gaji":              { icon: <Briefcase className="h-4 w-4" />, color: "bg-emerald-500" },
  "Freelance":         { icon: <Laptop className="h-4 w-4" />,    color: "bg-teal-500" },
  "Makanan & Minuman": { icon: <Utensils className="h-4 w-4" />,  color: "bg-orange-400" },
  "Transportasi":      { icon: <Car className="h-4 w-4" />,       color: "bg-blue-400" },
  "Tagihan":           { icon: <Zap className="h-4 w-4" />,       color: "bg-yellow-400" },
  "Belanja":           { icon: <ShoppingBag className="h-4 w-4" />, color: "bg-pink-400" },
  "Kesehatan":         { icon: <Heart className="h-4 w-4" />,     color: "bg-red-400" },
  "Hiburan":           { icon: <Gamepad2 className="h-4 w-4" />,  color: "bg-purple-400" },
  "Pendidikan":        { icon: <GraduationCap className="h-4 w-4" />, color: "bg-indigo-400" },
  "Lainnya":           { icon: <MoreHorizontal className="h-4 w-4" />, color: "bg-slate-400" },
};

const categoryOptions: DropdownOption[] = categories.map((c) => ({
  value: c,
  label: c,
  icon: categoryMeta[c]?.icon,
  color: categoryMeta[c]?.color,
}));

const typeOptions: DropdownOption[] = [
  {
    value: "expense",
    label: "Pengeluaran",
    icon: <TrendingDown className="h-4 w-4" />,
    color: "bg-red-400",
    description: "Uang keluar",
  },
  {
    value: "income",
    label: "Pemasukan",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-emerald-500",
    description: "Uang masuk",
  },
];

const currencyOptions: DropdownOption[] = CURRENCY_CODES.map((code) => ({
  value: code,
  label: `${code} — ${SUPPORTED_CURRENCIES[code].name}`,
  description: SUPPORTED_CURRENCIES[code].symbol,
}));

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionForm({
  transaction,
  hideCard,
  userCurrency = "IDR",
}: {
  transaction?: Transaction;
  hideCard?: boolean;
  userCurrency?: CurrencyCode;
}) {
  const initialCategory = useMemo(() => {
    if (!transaction?.category) return "Makanan & Minuman";
    return categories.includes(transaction.category) ? transaction.category : "Lainnya";
  }, [transaction?.category]);

  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState<string>(transaction?.type ?? "expense");
  const [currency, setCurrency] = useState<string>(
    (transaction as any)?.currency ?? userCurrency
  );
  const [customCategory, setCustomCategory] = useState(
    transaction?.category && !categories.includes(transaction.category) ? transaction.category : ""
  );

  const form = (
    <form action={saveTransaction} className="space-y-4">
      <input type="hidden" name="id" defaultValue={transaction?.id} />
      {/* Hidden fields for CustomSelect values */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="currency" value={currency} />
      {category === "Lainnya" && (
        <input type="hidden" name="custom_category" value={customCategory} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={transaction?.date ?? (() => {
              const now = new Date();
              return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
            })()}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Jenis</Label>
          <CustomSelect
            options={typeOptions}
            value={type}
            onChange={setType}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <CustomSelect
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          {category === "Lainnya" && (
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Nama kategori kustom"
              className="mt-2"
              required
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Jumlah ({getCurrencySymbol(currency as CurrencyCode)})</Label>
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
        <Label>Mata Uang</Label>
        <CustomSelect
          options={currencyOptions}
          value={currency}
          onChange={setCurrency}
        />
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
