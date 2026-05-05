"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { BudgetForm } from "@/components/budgets/budget-form";
import { deleteBudgetById } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

const PAGE_SIZE = 5;

function budgetStatus(percent: number) {
  if (percent > 100) return { label: "Lebih", bar: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" };
  if (percent >= 80) return { label: "Waspada", bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Aman", bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

interface BudgetSectionProps {
  budgets: Budget[];
  spending: Record<string, number>;
}

export function BudgetSection({ budgets, spending }: BudgetSectionProps) {
  const [editBudget, setEditBudget] = useState<Budget | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setMounted(true); }, []);

  // Auto-close modal when budgets data changes
  const budgetIds = budgets.map((b) => b.id).join(",");
  useEffect(() => {
    setShowModal(false);
    setEditBudget(undefined);
  }, [budgetIds]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(budgets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = budgets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when data changes
  useEffect(() => { setPage(1); }, [budgetIds]);

  function openAdd() {
    setEditBudget(undefined);
    setShowModal(true);
  }

  function openEdit(budget: Budget) {
    setEditBudget(budget);
    setShowModal(true);
  }

  function closeModal() {
    setEditBudget(undefined);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setDeletingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      await deleteBudgetById(id);
    });
  }

  const modal =
    showModal && mounted
      ? createPortal(
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "1rem" }}
            onClick={closeModal}
          >
            <div
              style={{ maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto", borderRadius: "1.5rem", backgroundColor: "#fff", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  {editBudget ? "Edit Anggaran" : "Tambah Anggaran"}
                </h2>
                <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">
                <BudgetForm editBudget={editBudget} onCancel={closeModal} />
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
              <CardTitle>Daftar Anggaran</CardTitle>
              <p className="mt-0.5 text-xs text-slate-400">{budgets.length} anggaran</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length ? (
            <>
              {/* Mobile cards */}
              <div className="space-y-2.5 sm:hidden">
                {paged.filter((b) => !deletingIds.has(b.id)).map((b) => {
                  const used = spending[b.category] ?? 0;
                  const pct = b.monthly_limit > 0 ? Math.round((used / Number(b.monthly_limit)) * 100) : 0;
                  const s = budgetStatus(pct);
                  return (
                    <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{b.category}</span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", s.badge)}>{s.label}</span>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                          <div className={cn("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                          <span>{formatCurrency(used)} / {formatCurrency(Number(b.monthly_limit))}</span>
                          <span>{pct}%</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end gap-1.5">
                        <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <ConfirmDelete 
                          title={`anggaran "${b.category}"`}
                          message="Anggaran ini akan dihapus permanen dan tidak dapat dikembalikan."
                          onConfirm={() => handleDelete(b.id)}
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
                      <th className="pb-3 text-xs font-medium text-slate-400">Kategori</th>
                      <th className="pb-3 text-xs font-medium text-slate-400">Batas</th>
                      <th className="pb-3 text-xs font-medium text-slate-400">Terpakai</th>
                      <th className="pb-3 text-xs font-medium text-slate-400">Progress</th>
                      <th className="pb-3 text-right text-xs font-medium text-slate-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.filter((b) => !deletingIds.has(b.id)).map((b) => {
                      const used = spending[b.category] ?? 0;
                      const pct = b.monthly_limit > 0 ? Math.round((used / Number(b.monthly_limit)) * 100) : 0;
                      const s = budgetStatus(pct);
                      return (
                        <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all duration-200 animate-in fade-in">
                          <td className="py-3 font-medium text-slate-900">{b.category}</td>
                          <td className="py-3 text-slate-600">{formatCurrency(Number(b.monthly_limit))}</td>
                          <td className="py-3 text-slate-600">{formatCurrency(used)}</td>
                          <td className="py-3">
                            <div className="w-32">
                              <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                                <div className={cn("h-full rounded-full transition-all", s.bar)} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <div className="mt-1 flex items-center justify-between text-xs">
                                <span className="text-slate-400">{pct}%</span>
                                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", s.badge)}>{s.label}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openEdit(b)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <ConfirmDelete 
                                title={`anggaran "${b.category}"`}
                                message="Anggaran ini akan dihapus permanen dan tidak dapat dikembalikan."
                                onConfirm={() => handleDelete(b.id)}
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
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                          p === currentPage ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
              <span>Belum ada anggaran.</span>
              <button onClick={openAdd} className="font-medium text-blue-500 hover:text-blue-600">
                + Tambah sekarang
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      {modal}
    </>
  );
}
