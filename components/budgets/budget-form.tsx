"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveBudget } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Budget, categories } from "@/lib/finance";

interface BudgetFormProps {
  editBudget?: Budget;
  onCancel?: () => void;
}

export function BudgetForm({ editBudget, onCancel }: BudgetFormProps) {
  const initialCategory = useMemo(() => {
    if (!editBudget) return "Makanan";
    return categories.includes(editBudget.category) ? editBudget.category : "Lainnya";
  }, [editBudget]);

  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState(
    editBudget && !categories.includes(editBudget.category) ? editBudget.category : ""
  );

  // When used inside modal (onCancel provided), render without Card wrapper
  const form = (
    <form action={saveBudget} className="space-y-4">
      {editBudget && <input type="hidden" name="id" value={editBudget.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="budget-category">Kategori</Label>
          <Select id="budget-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories
              .filter((c) => !["Gaji", "Freelance"].includes(c))
              .map((c) => (
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
          <Label htmlFor="monthly_limit">Batas Bulanan</Label>
          <Input id="monthly_limit" name="monthly_limit" type="number" min="0" step="any" defaultValue={editBudget?.monthly_limit ?? ""} placeholder="0" required />
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
