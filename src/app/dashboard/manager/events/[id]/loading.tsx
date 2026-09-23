export default function ManagerEventDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 animate-pulse">
      {/* Navbar Placeholder */}
      <div className="h-16 bg-white border-b border-slate-200" />

      {/* Main Content Skeleton */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>

        {/* Action / Status Callout Skeleton */}
        <div className="h-20 bg-slate-200/70 rounded-2xl" />

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-7 w-64 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-40 bg-slate-200 rounded" />
                </div>
                <div className="h-7 w-24 bg-slate-200 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-slate-100 rounded-xl" />
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
              <div className="h-24 bg-slate-100 rounded-xl" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48" />
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48" />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="space-y-3">
                <div className="h-4 w-40 bg-slate-100 rounded" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
              <div className="h-5 w-28 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
