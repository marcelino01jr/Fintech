// ─── Supported Currencies ─────────────────────────────────────────────────────

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

export const CURRENCY_CODES = Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isValidCurrency(code: string): code is CurrencyCode {
  return code in SUPPORTED_CURRENCIES;
}

export function getCurrencyConfig(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES[code];
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[code].symbol;
}

export function getCurrencyLabel(code: CurrencyCode): string {
  const config = SUPPORTED_CURRENCIES[code];
  return `${code} - ${config.name}`;
}

/** Get all currencies as dropdown options */
export function getCurrencyOptions() {
  return CURRENCY_CODES.map((code) => ({
    value: code,
    label: `${code} - ${SUPPORTED_CURRENCIES[code].name}`,
    symbol: SUPPORTED_CURRENCIES[code].symbol,
  }));
}
