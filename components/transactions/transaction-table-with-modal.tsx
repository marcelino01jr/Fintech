"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteTransactionById } from "@/app/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

import { Transaction } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/utils";
import { isValidCurrency, type CurrencyCode } from "@/lib/currency";

function formatDateTime(date: string, createdAt: string) {
  const time = new Date(createdAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  urls: Record<number, string>;
}

export function TransactionTableWithModal({
  transactions,
  editTransaction,
  pagination,
  userCurrency = "IDR",
  savedKey,
}: {
  transactions: Transaction[];
  editTransaction?: Transaction;
  pagination: PaginationProps;
  userCurrency?: CurrencyCode;
  savedKey?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setMounted(true); }, []);

  // Auto-close modal when data changes
  const txIds = transactions.map((t) => t.id).join(",");
  useEffect(() => { setShowForm(false); }, [txIds]);

  // Auto-close modal after successful save
  useEffect(() => {
    if (savedKey) setShowForm(false);
  }, [savedKey]);

  // Auto-open modal when editing
  useEffect(() => {
    if (editTransaction) setShowForm(true);
  }, [editTransaction]);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showForm]);

  function handleDelete(id: string) {
    setDeletingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await deleteTransactionById(id);
    });
  }

  const { currentPage, totalPages, total, urls } = pagination;

  function txCurrency(t: Transaction): CurrencyCode {
    return (t.currency && isValidCurrency(t.currency) ? t.currency : "IDR") as CurrencyCode;
  }

  const modal =
    showForm && mounted
      ? createPortal(
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "1rem" }}
            onClick={() => setShowForm(false)}
          >
            <div
              style={{ maxWidth: "560px", width: "100%", borderRadius: "1.5rem", backgroundColor: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — fixed */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  {editTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
                </h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Body — scrollable */}
              <div className="overflow-y-auto p-5">
                <TransactionForm transaction={editTransaction} hideCard userCurrency={userCurrency} />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Transaksi</CardTitle>
              <p className="mt-0.5 text-xs text-slate-400">{total} transaksi</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length ? (
            <>
              {/* Mobile cards */}
              <div className="space-y-2.5 sm:hidden">
                {transactions.filter((t) => !deletingIds.has(t.id)).map((t) => {
                  const dt = formatDateTime(t.date, t.created_at);
                  return (
                    <div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{t.description}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <span>{dt.date} · {dt.time}</span>
                            <span className="rounded-full bg-slate-200/60 px-2 py-0.5">{t.category}</span>
                          </div>
                        </div>
                        <p className={cn("shrink-0 text-sm font-bold", t.type === "income" ? "text-emerald-600" : "text-red-500")}>
                          {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount), txCurrency(t))}
                        </p>
                      </div>
                      <div className="mt-2.5 flex justify-end gap-1.5">
                        <Link href={`/transactions?edit=${t.id}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <ConfirmDelete 
                          title={`transaksi "${t.description?.substring(0,30)}${t.description?.length > 30 ? '...' : ''}"`}
                          message="Data transaksi ini akan dihapus permanen dan tidak dapat dikembalikan."
                          onConfirm={() => handleDelete(t.id)}
                        >
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Hapus">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </ConfirmDelete>
                      </div>
                    </div>
                  );
                })}
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
                    {transactions.filter((t) => !deletingIds.has(t.id)).map((t) => {
                      const dt = formatDateTime(t.date, t.created_at);
                      return (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all duration-200 animate-in fade-in">
                          <td className="py-3">
                            <span className="text-slate-700">{dt.date}</span>
                            <span className="ml-1.5 text-xs text-slate-400">{dt.time}</span>
                          </td>
                          <td className="py-3 font-medium text-slate-900">{t.description}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{t.category}</span>
                          </td>
                          <td className={cn("py-3 text-right font-bold", t.type === "income" ? "text-emerald-600" : "text-red-500")}>
                            {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount), txCurrency(t))}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-1">
                              <Link href={`/transactions?edit=${t.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Edit">
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <ConfirmDelete 
                                title={`transaksi "${t.description?.substring(0,30)}${t.description?.length > 30 ? '...' : ''}"`}
                                message="Data transaksi ini akan dihapus permanen dan tidak dapat dikembalikan."
                                onConfirm={() => handleDelete(t.id)}
                              >
                                <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label="Hapus">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </ConfirmDelete>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Halaman {currentPage} dari {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    {currentPage > 1 ? (
                      <Link href={urls[currentPage - 1]} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100">
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300">
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={urls[p]}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                          p === currentPage
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {p}
                      </Link>
                    ))}
                    {currentPage < totalPages ? (
                      <Link href={urls[currentPage + 1]} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              Tidak ada transaksi.
            </div>
          )}
        </CardContent>
      </Card>
      {modal}
    </>
  );
}
