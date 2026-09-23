export default function ManagerDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 animate-pulse">
      {/* Navbar Placeholder */}
      <div className="h-16 bg-white border-b border-slate-200" />

      {/* Main Content Skeleton */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-32 bg-slate-200 rounded-xl" />
            <div className="h-9 w-36 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="w-9 h-9 rounded-xl bg-slate-200" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded-md" />
              <div className="h-3 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* Table / List Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                </div>
                <div className="h-4 w-32 bg-slate-200 rounded hidden sm:block" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-8 w-20 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
