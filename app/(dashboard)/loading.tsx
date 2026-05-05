import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 page-enter">
      {/* Hero card skeleton */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-6 sm:p-8">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-5" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-7 w-36" />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-2xl md:col-span-2 lg:col-span-1" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>

      {/* Transaction list skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
