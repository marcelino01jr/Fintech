"use client";

import * as React from "react";
import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Native select (for server-side forms) ───────────────────────────────────

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-all",
          "focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "pr-10 cursor-pointer hover:border-slate-300",
          className
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

// ─── Custom dropdown ──────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

interface CustomSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className,
  name,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find((o) => o.value === value);

  useEffect(() => { setMounted(true); }, []);

  // Calculate dropdown position relative to trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = Math.min(options.length * 48 + 12, 260);

    // Open upward if not enough space below
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: viewportHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
    });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, updatePosition]);

  const dropdown = open && mounted ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 animate-in fade-in-0 zoom-in-95 duration-100"
    >
      <div className="max-h-60 overflow-y-auto p-1.5">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {option.color && (
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", option.color)} />
              )}
              {option.icon && (
                <span className={cn("shrink-0", isSelected ? "text-blue-500" : "text-slate-400")}>
                  {option.icon}
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block truncate font-medium">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-slate-400 mt-0.5">{option.description}</span>
                )}
              </span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-500" />}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-sm shadow-sm transition-all",
          open
            ? "border-blue-300 ring-2 ring-blue-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selected?.color && (
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", selected.color)} />
          )}
          {selected?.icon && (
            <span className="shrink-0 text-slate-500">{selected.icon}</span>
          )}
          <span className={cn("truncate", selected ? "text-slate-900 font-medium" : "text-slate-400")}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {dropdown}
    </div>
  );
}
