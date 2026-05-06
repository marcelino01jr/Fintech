# Technical Design: Multi-Currency Support

## Overview

Add multi-currency support to the personal finance tracker, allowing users to set a preferred display currency and record transactions in any supported currency. The system preserves historical accuracy by storing currency per transaction and provides optional exchange rate conversion for mixed-currency summaries.

## Architecture

### Data Flow

```
User sets preferred currency (Profile)
         │
         ▼
┌─────────────────────┐
│  users.currency     │ ← stored in DB
└─────────────────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│ New Transaction     │────▶│ transactions.currency │
│ (defaults to user's │     │ (stored per record)   │
│  preferred)         │     └──────────────────────┘
└─────────────────────┘
         │
         ▼
┌─────────────────────┐     ┌──────────────────────┐
│ Dashboard Summary   │────▶│ Exchange Rate Cache   │
│ (convert to user's  │     │ (1hr TTL, in-memory)  │
│  preferred)         │     └──────────────────────┘
└─────────────────────┘
```

## Database Schema Changes

### Users Table - Add `currency` column

```typescript
// lib/db/schema.ts - users table addition
currency: text("currency").notNull().default("IDR"),
```

### Transactions Table - Add `currency` column

```typescript
// lib/db/schema.ts - transactions table addition
currency: text("currency").notNull().default("IDR"),
```

### Migration SQL

```sql
-- 0002_add_currency.sql
ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR';
ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'IDR';
```

## New Module: `lib/currency.ts`

Defines supported currencies with locale mappings and formatting config.

```typescript
export const SUPPORTED_CURRENCIES = {
  IDR: { locale: "id-ID", name: "Indonesian Rupiah", symbol: "Rp", fractionDigits: 0 },
  CNY: { locale: "zh-CN", name: "Chinese Yuan", symbol: "¥", fractionDigits: 2 },
  JPY: { locale: "ja-JP", name: "Japanese Yen", symbol: "¥", fractionDigits: 0 },
  USD: { locale: "en-US", name: "US Dollar", symbol: "$", fractionDigits: 2 },
  EUR: { locale: "de-DE", name: "Euro", symbol: "€", fractionDigits: 2 },
  GBP: { locale: "en-GB", name: "British Pound", symbol: "£", fractionDigits: 2 },
  SGD: { locale: "en-SG", name: "Singapore Dollar", symbol: "S$", fractionDigits: 2 },
  MYR: { locale: "ms-MY", name: "Malaysian Ringgit", symbol: "RM", fractionDigits: 2 },
  KRW: { locale: "ko-KR", name: "South Korean Won", symbol: "₩", fractionDigits: 0 },
  THB: { locale: "th-TH", name: "Thai Baht", symbol: "฿", fractionDigits: 2 },
  AUD: { locale: "en-AU", name: "Australian Dollar", symbol: "A$", fractionDigits: 2 },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;
```

## Updated `formatCurrency` in `lib/utils.ts`

```typescript
export function formatCurrency(value: number, currency: CurrencyCode = "IDR") {
  const config = SUPPORTED_CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: config.fractionDigits,
  }).format(value);
}
```

## Exchange Rate Service: `lib/exchange-rate.ts`

- Uses free API: `https://open.er-api.com/v6/latest/{base}`
- In-memory cache with 1-hour TTL
- Graceful fallback: if API unavailable, skip conversion and show amounts in original currency

```typescript
type RateCache = {
  rates: Record<string, number>;
  fetchedAt: number;
};

const cache = new Map<string, RateCache>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number | null>
export async function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number | null>
```

## Component Changes

### Profile Page (`app/(dashboard)/profile/page.tsx`)
- Add "Mata Uang" section with currency selector dropdown
- New server action `updateCurrency` in `app/actions.ts`

### Transaction Form (`components/transactions/transaction-form.tsx`)
- Add currency selector (defaults to user's preferred currency)
- Pass `currency` field in form submission
- Update label from "Jumlah (Rp)" to dynamic "Jumlah ({symbol})"

### Summary Card (`components/summary-card.tsx`)
- Accept `currency` prop
- Pass currency to `formatCurrency`

### Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)
- Fetch user's preferred currency
- Pass currency to all display components
- Handle mixed-currency months with conversion indicator

### Budget Components
- Display budget limits in user's preferred currency
- Budget form uses user's preferred currency

## Server Action Changes

### `saveTransaction` update
- Accept `currency` field from form data
- Default to user's preferred currency if not provided

### New action: `updateCurrency`
- Updates user's `currency` field in database
- Revalidates all dashboard paths

## Correctness Properties

1. **Currency Preservation**: A transaction's currency field MUST never change after creation, regardless of user preference changes
2. **Default Consistency**: New transactions MUST default to the user's current preferred currency
3. **Format Correctness**: `formatCurrency(x, code)` MUST produce output matching `Intl.NumberFormat` for that currency code
4. **Fallback Safety**: If exchange rate is unavailable, amounts MUST display in their original currency (no silent data loss)
5. **Migration Safety**: All existing records MUST have currency set to "IDR" after migration (no nulls)
