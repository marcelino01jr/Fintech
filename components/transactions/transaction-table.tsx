"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransactionById } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { Transaction } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/currency";
import { isValidCurrency } from "@/lib/currency";

export function TransactionTable({
  transactions,
  showTitle = true,
}: {
  transactions: Transaction[];
  showTitle?: boolean;
}) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setDeletingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await deleteTransactionById(id);
    });
  }

  const visible = transactions.filter((t) => !deletingIds.has(t.id));

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {visible.length ? (
          <>
            {/* Mobile cards */}
            <div className="space-y-2.5 sm:hidden">
              {visible.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>{t.date}</span>
                        <span className="rounded-full bg-slate-200/60 px-2 py-0.5">{t.category}</span>
                      </div>
                    </div>
                    <p className={cn("shrink-0 text-sm font-bold", t.type === "income" ? "text-emerald-600" : "text-red-500")}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount), (t.currency && isValidCurrency(t.currency) ? t.currency : "IDR") as CurrencyCode)}
                    </p>
                  </div>
                  <div className="mt-2.5 flex justify-end gap-1.5">
                    <Link
                      href={`/transactions?edit=${t.id}`}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <ConfirmDelete
                      title={`transaksi "${t.description?.substring(0,30)}${t.description?.length > 30 ? '...' : ''}"`}
                      message="Data transaksi ini akan dihapus permanen dan tidak dapat dikembalikan."
                      onConfirm={() => handleDelete(t.id)}
                    >
                      <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="Hapus">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </ConfirmDelete>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 text-xs font-medium text-slate-400">Tanggal</th>
                    <th className="pb-3 text-xs font-medium text-slate-400">Deskripsi</th>
                    <th className="pb-3 text-xs font-medium text-slate-400">Kategori</th>
                    <th className="pb-3 text-right text-xs font-medium text-slate-400">Jumlah</th>
                    <th className="pb-3 text-right text-xs font-medium text-slate-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all duration-200 animate-in fade-in">
                      <td className="py-3 text-slate-500">{t.date}</td>
                      <td className="py-3 font-medium text-slate-900">{t.description}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{t.category}</span>
                      </td>
                      <td className={cn("py-3 text-right font-bold", t.type === "income" ? "text-emerald-600" : "text-red-500")}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount), (t.currency && isValidCurrency(t.currency) ? t.currency : "IDR") as CurrencyCode)}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/transactions?edit=${t.id}`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ConfirmDelete
                            title={`transaksi "${t.description?.substring(0,30)}${t.description?.length > 30 ? '...' : ''}"`}
                            message="Data transaksi ini akan dihapus permanen dan tidak dapat dikembalikan."
                            onConfirm={() => handleDelete(t.id)}
                          >
                            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="Hapus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </ConfirmDelete>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
            Tidak ada transaksi.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
