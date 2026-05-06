import type { CurrencyCode } from "@/lib/currency";

// ─── Types ────────────────────────────────────────────────────────────────────

type RateCache = {
  rates: Record<string, number>;
  fetchedAt: number;
};

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

const cache = new Map<string, RateCache>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Fetch exchange rates for a base currency.
 * Uses the free open.er-api.com endpoint.
 * Returns null if the API is unavailable.
 */
async function fetchRates(base: CurrencyCode): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      next: { revalidate: 3600 }, // Next.js fetch cache: 1 hour
    });

    if (!res.ok) {
      console.error(`[ExchangeRate] API returned ${res.status} for base ${base}`);
      return null;
    }

    const data = await res.json();

    if (data.result !== "success") {
      console.error(`[ExchangeRate] API error for base ${base}:`, data);
      return null;
    }

    return data.rates as Record<string, number>;
  } catch (err) {
    console.error(`[ExchangeRate] Failed to fetch rates for ${base}:`, err);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the exchange rate from one currency to another.
 * Returns null if rates are unavailable.
 */
export async function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number | null> {
  if (from === to) return 1;

  // Check cache
  const cached = cache.get(from);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.rates[to] ?? null;
  }

  // Fetch fresh rates
  const rates = await fetchRates(from);
  if (!rates) {
    // Return stale cache if available
    if (cached) return cached.rates[to] ?? null;
    return null;
  }

  // Update cache
  cache.set(from, { rates, fetchedAt: Date.now() });
  return rates[to] ?? null;
}

/**
 * Convert an amount from one currency to another.
 * Returns null if conversion is not possible (rates unavailable).
 */
export async function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number | null> {
  if (from === to) return amount;

  const rate = await getExchangeRate(from, to);
  if (rate === null) return null;

  return amount * rate;
}

/**
 * Convert multiple amounts from various currencies to a target currency.
 * Returns the converted total and a flag indicating if all conversions succeeded.
 */
export async function convertAmounts(
  items: { amount: number; currency: CurrencyCode }[],
  targetCurrency: CurrencyCode
): Promise<{ total: number; allConverted: boolean }> {
  let total = 0;
  let allConverted = true;

  for (const item of items) {
    if (item.currency === targetCurrency) {
      total += item.amount;
    } else {
      const converted = await convertAmount(item.amount, item.currency, targetCurrency);
      if (converted !== null) {
        total += converted;
      } else {
        // Fallback: add unconverted (not ideal, but prevents data loss)
        total += item.amount;
        allConverted = false;
      }
    }
  }

  return { total, allConverted };
}
