"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { categories } from "@/lib/finance";
import { cn } from "@/lib/utils";

const allOption = { value: "all", label: "Semua Kategori" };
const options = [allOption, ...categories.map((c) => ({ value: c, label: c }))];

export function CategoryFilter({
  month,
  category,
}: {
  month: string;
  category: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === category) ?? allOption;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handle);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  function select(value: string) {
    const params = new URLSearchParams();
    params.set("month", month);
    if (value !== "all") params.set("category", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-sm shadow-sm transition-all",
          open
            ? "border-blue-300 ring-2 ring-blue-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className={cn("truncate font-medium", category === "all" ? "text-slate-400" : "text-slate-900")}>
            {selected.label}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.map((opt) => {
              const isSelected = opt.value === category;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
