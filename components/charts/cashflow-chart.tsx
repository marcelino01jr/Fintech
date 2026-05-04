"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "income" ? "Masuk" : p.dataKey === "expense" ? "Keluar" : "Saldo"}:{" "}
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export function CashflowChart({
  data,
}: {
  data: Array<{ date: string; income: number; expense: number; balance: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashflow Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}m`} width={48} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
            Belum ada data cashflow.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
