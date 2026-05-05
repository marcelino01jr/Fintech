import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Filter bar skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl sm:w-24 sm:shrink-0" />
        </div>
      </div>

      {/* Transaction table skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>

        {/* Mobile skeleton */}
        <div className="space-y-2.5 sm:hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop skeleton */}
        <div className="hidden sm:block">
          <div className="border-b border-slate-100 pb-3 grid grid-cols-5 gap-4">
            {["Tanggal", "Deskripsi", "Kategori", "Jumlah", "Aksi"].map((h) => (
              <Skeleton key={h} className="h-3 w-16" />
            ))}
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 grid grid-cols-5 gap-4 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 ml-auto" />
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
