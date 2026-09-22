'use client';

interface VendorStatusCounts {
  total: number;
  assigned: number;
  accepted: number;
  in_progress: number;
  ready: number;
  completed: number;
}

interface VendorMonitoringSummaryProps {
  assignments: Array<{
    status: string;
  }>;
}

export default function VendorMonitoringSummary({ assignments }: VendorMonitoringSummaryProps) {
  const counts: VendorStatusCounts = assignments.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.status === 'assigned') acc.assigned += 1;
      else if (curr.status === 'accepted') acc.accepted += 1;
      else if (curr.status === 'in_progress') acc.in_progress += 1;
      else if (curr.status === 'ready') acc.ready += 1;
      else if (curr.status === 'completed') acc.completed += 1;
      return acc;
    },
    {
      total: 0,
      assigned: 0,
      accepted: 0,
      in_progress: 0,
      ready: 0,
      completed: 0,
    }
  );

  const readyOrCompleted = counts.ready + counts.completed;
  const progressPercent = counts.total > 0 ? Math.round((readyOrCompleted / counts.total) * 100) : 0;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Ringkasan Monitoring Kesiapan Vendor</span>
          </h4>
          <p className="text-xs text-slate-500">
            Kesiapan logistik dan operasional mitra vendor pada event ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Kesiapan:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {readyOrCompleted} dari {counts.total} Vendor Siap ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* Assigned */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Assigned
          </div>
          <div className="text-xl font-bold text-slate-800">{counts.assigned}</div>
          <div className="text-[10px] text-slate-500">Menunggu Konfirmasi</div>
        </div>

        {/* Accepted */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/70 text-center space-y-1">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
            Accepted
          </div>
          <div className="text-xl font-bold text-blue-800">{counts.accepted}</div>
          <div className="text-[10px] text-blue-600">Dikonfirmasi</div>
        </div>

        {/* In Progress */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-center space-y-1">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-xl font-bold text-amber-800">{counts.in_progress}</div>
          <div className="text-[10px] text-amber-600">Sedang Dikerjakan</div>
        </div>

        {/* Ready */}
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/70 text-center space-y-1">
          <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
            Ready
          </div>
          <div className="text-xl font-bold text-purple-800">{counts.ready}</div>
          <div className="text-[10px] text-purple-600">Siap di Lokasi</div>
        </div>

        {/* Completed */}
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-center space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-xl font-bold text-emerald-800">{counts.completed}</div>
          <div className="text-[10px] text-emerald-600">Pekerjaan Selesai</div>
        </div>
      </div>
    </div>
  );
}
