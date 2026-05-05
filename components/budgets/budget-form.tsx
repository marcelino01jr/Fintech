"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Utensils, Car, Zap, ShoppingBag, Heart,
  Gamepad2, GraduationCap, MoreHorizontal
} from "lucide-react";
import { saveBudget } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/select";
import type { DropdownOption } from "@/components/ui/select";
import { Budget, categories } from "@/lib/finance";

const budgetCategories = categories.filter((c) => !["Gaji", "Freelance"].includes(c));

const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  "Makanan & Minuman": { icon: <Utensils className="h-4 w-4" />, color: "bg-orange-400" },
  "Transportasi":      { icon: <Car className="h-4 w-4" />,      color: "bg-blue-400" },
  "Tagihan":           { icon: <Zap className="h-4 w-4" />,      color: "bg-yellow-400" },
  "Belanja":           { icon: <ShoppingBag className="h-4 w-4" />, color: "bg-pink-400" },
  "Kesehatan":         { icon: <Heart className="h-4 w-4" />,    color: "bg-red-400" },
  "Hiburan":           { icon: <Gamepad2 className="h-4 w-4" />, color: "bg-purple-400" },
  "Pendidikan":        { icon: <GraduationCap className="h-4 w-4" />, color: "bg-indigo-400" },
  "Lainnya":           { icon: <MoreHorizontal className="h-4 w-4" />, color: "bg-slate-400" },
};

const categoryOptions: DropdownOption[] = budgetCategories.map((c) => ({
  value: c,
  label: c,
  icon: categoryMeta[c]?.icon,
  color: categoryMeta[c]?.color,
}));

interface BudgetFormProps {
  editBudget?: Budget;
  onCancel?: () => void;
}

export function BudgetForm({ editBudget, onCancel }: BudgetFormProps) {
  const initialCategory = useMemo(() => {
    if (!editBudget) return "Makanan & Minuman";
    return budgetCategories.includes(editBudget.category) ? editBudget.category : "Lainnya";
  }, [editBudget]);

  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState(
    editBudget && !budgetCategories.includes(editBudget.category) ? editBudget.category : ""
  );

  const form = (
    <form action={saveBudget} className="space-y-4">
      {editBudget && <input type="hidden" name="id" value={editBudget.id} />}
      <input type="hidden" name="category" value={category} />
      {category === "Lainnya" && (
        <input type="hidden" name="custom_category" value={customCategory} />
      )}

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
          <Label htmlFor="monthly_limit">Batas Bulanan (Rp)</Label>
          <Input
            id="monthly_limit"
            name="monthly_limit"
            type="number"
            min="0"
            step="any"
            defaultValue={editBudget?.monthly_limit ?? ""}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <SubmitButton>{editBudget ? "Perbarui" : "Simpan Anggaran"}</SubmitButton>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        )}
        {editBudget && !onCancel && (
          <Button asChild variant="outline"><Link href="/budgets">Batal</Link></Button>
        )}
      </div>
    </form>
  );

  if (onCancel) return form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editBudget ? "Edit Anggaran" : "Tambah Anggaran"}</CardTitle>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
