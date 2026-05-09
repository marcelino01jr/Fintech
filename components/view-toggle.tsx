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
    <div className="inline-flex items-center self-start rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
      <button
        onClick={() => setView("monthly")}
        className={cn(
          "px-3 py-1 text-sm font-semibold rounded-lg transition-all duration-200",
          view === "monthly"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        Bulanan
      </button>
      <button
        onClick={() => setView("yearly")}
        className={cn(
          "px-3 py-1 text-sm font-semibold rounded-lg transition-all duration-200",
          view === "yearly"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        Tahunan
      </button>
    </div>
  );
}
