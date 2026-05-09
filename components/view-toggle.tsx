"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "monthly";

  function setView(newView: "monthly" | "yearly") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        onClick={() => setView("monthly")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-xl transition-colors",
          view === "monthly"
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        Bulanan
      </button>
      <button
        onClick={() => setView("yearly")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-xl transition-colors",
          view === "yearly"
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        Tahunan
      </button>
    </div>
  );
}
