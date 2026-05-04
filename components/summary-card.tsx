import { ArrowDownCircle, ArrowUpCircle, WalletCards } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const config = {
  income: { icon: ArrowUpCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  expense: { icon: ArrowDownCircle, color: "text-red-500", bg: "bg-red-50" },
  balance: { icon: WalletCards, color: "text-blue-600", bg: "bg-blue-50" },
};

export function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
}) {
  const { icon: Icon, color, bg } = config[tone];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
        <span className={cn("rounded-xl p-2", bg, color)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-2xl">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
