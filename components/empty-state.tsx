import { CircleDollarSign } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center sm:rounded-3xl sm:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
        <CircleDollarSign className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
