import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type CurrencyCode, SUPPORTED_CURRENCIES, isValidCurrency } from "@/lib/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: CurrencyCode = "IDR") {
  const config = isValidCurrency(currency)
    ? SUPPORTED_CURRENCIES[currency]
    : SUPPORTED_CURRENCIES["IDR"];

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: config.fractionDigits,
  }).format(value);
}

export function currentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Normalize date from CockroachDB — may return Date object or string */
export function normalizeDate(d: string | Date | unknown): string {
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}
