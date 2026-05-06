"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/currency";

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.dataKey === "income" ? "Masuk" : "Keluar"}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

export function DailyCashflowChart({
  data,
  currency = "IDR",
}: {
  data: Array<{ date: string; income: number; expense: number }>;
  currency?: CurrencyCode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow Harian</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1_000).toFixed(0)}k`} width={40} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={24} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
            Belum ada transaksi.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
