"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NoSpaceInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      onKeyDown={(e) => {
        if (e.key === " ") e.preventDefault();
        props.onKeyDown?.(e);
      }}
      className={cn(
        "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        props.className
      )}
    />
  );
}
