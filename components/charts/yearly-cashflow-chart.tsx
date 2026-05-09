"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface YearlyCashflowChartProps {
  data: {
    month: string;
    label: string;
    income: number;
    expense: number;
  }[];
  currency?: string;
}

export function YearlyCashflowChart({ data, currency = "IDR" }: YearlyCashflowChartProps) {
  // Hanya tampilkan bulan yang memiliki data atau sampai bulan terakhir yang ada transaksinya.
  // Tapi untuk laporan tahunan, biasanya lebih enak melihat full 12 bulan.
  
  return (
    <Card className="col-span-full rounded-3xl border-slate-200/60 shadow-sm">
      <CardHeader className="px-6 py-5">
        <CardTitle className="text-base text-slate-800">Arus Kas Tahunan</CardTitle>
        <CardDescription>Perbandingan pemasukan dan pengeluaran tiap bulan.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-6 sm:px-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#64748b" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => 
                  new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(value)
                }
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm">
                        <p className="mb-2 font-semibold text-slate-900">{label}</p>
                        <div className="space-y-1.5">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-slate-500">
                                  {entry.name === "income" ? "Pemasukan" : "Pengeluaran"}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-slate-900">
                                {formatCurrency(entry.value as number, currency as any)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm font-medium text-slate-600">
                    {value === "income" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                )}
              />
              <Bar 
                dataKey="income" 
                name="income" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="expense" 
                name="expense" 
                fill="#f43f5e" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
