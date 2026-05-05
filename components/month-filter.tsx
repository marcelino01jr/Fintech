"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { currentMonth } from "@/lib/utils";

interface MonthFilterProps {
  month: string;
}

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const newYear = d.getFullYear();
  const newMonth = String(d.getMonth() + 1).padStart(2, "0");
  return `${newYear}-${newMonth}`;
}

export function MonthFilter({ month }: MonthFilterProps) {
  const router = useRouter();

  function go(m: string) {
    router.push(`?month=${m}`);
  }

  const isCurrentMonth = month === currentMonth();

  return (
    <div className="mt-5 flex flex-col items-start gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Calendar className="h-4 w-4" />
        <span>Periode</span>
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm overflow-hidden max-w-full">
        <button
          onClick={() => go(shiftMonth(month, -1))}
          className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 px-2 sm:px-3 min-w-[100px] truncate text-center text-sm font-semibold text-slate-800">
          {formatMonthLabel(month)}
        </span>
        <button
          onClick={() => go(shiftMonth(month, 1))}
          disabled={isCurrentMonth}
          className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
