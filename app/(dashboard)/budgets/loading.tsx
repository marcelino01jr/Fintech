import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>

      {/* Budget list skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>

        {/* Mobile skeleton */}
        <div className="space-y-2.5 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop skeleton */}
        <div className="hidden sm:block">
          <div className="border-b border-slate-100 pb-3 grid grid-cols-5 gap-4">
            {["Kategori", "Batas", "Terpakai", "Progress", "Aksi"].map((h) => (
              <Skeleton key={h} className="h-3 w-16" />
            ))}
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3 grid grid-cols-5 gap-4 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <div className="w-32">
                  <Skeleton className="h-2 w-full rounded-full mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
