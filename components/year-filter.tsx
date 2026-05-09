"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface YearFilterProps {
  year: string;
}

export function YearFilter({ year }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function go(delta: number) {
    const newYear = Number(year) + delta;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear.toString());
    router.push(`?${params.toString()}`);
  }

  const isCurrentYear = year === new Date().getFullYear().toString();

  return (
    <div className="mt-5 flex flex-col items-start gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Calendar className="h-4 w-4" />
        <span>Periode</span>
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm overflow-hidden max-w-full">
        <button
          onClick={() => go(-1)}
          className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tahun sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex-1 px-2 sm:px-3 min-w-[100px] text-center text-sm font-bold text-slate-800">
          Tahun {year}
        </span>
        <button
          onClick={() => go(1)}
          disabled={isCurrentYear}
          className="flex shrink-0 h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Tahun berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
