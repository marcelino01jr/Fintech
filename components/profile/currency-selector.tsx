"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { updateCurrency } from "@/app/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { CustomSelect } from "@/components/ui/select";
import { CURRENCY_CODES, SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currency";
import type { DropdownOption } from "@/components/ui/select";

const currencyOptions: DropdownOption[] = CURRENCY_CODES.map((code) => ({
  value: code,
  label: `${code} — ${SUPPORTED_CURRENCIES[code].name}`,
  description: `${SUPPORTED_CURRENCIES[code].symbol}`,
}));

export function CurrencySelector({ currentCurrency }: { currentCurrency: CurrencyCode }) {
  const [currency, setCurrency] = useState<string>(currentCurrency);

  return (
    <form action={updateCurrency} className="mt-4 space-y-4">
      <input type="hidden" name="currency" value={currency} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mata Uang</label>
        <CustomSelect
          options={currencyOptions}
          value={currency}
          onChange={setCurrency}
          placeholder="Pilih mata uang..."
        />
        <p className="text-xs text-slate-400">
          Mata uang ini akan digunakan sebagai default untuk transaksi baru dan tampilan dashboard.
        </p>
      </div>

      {currency !== currentCurrency && (
        <SubmitButton className="h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/25">
          Simpan Mata Uang
        </SubmitButton>
      )}
    </form>
  );
}
