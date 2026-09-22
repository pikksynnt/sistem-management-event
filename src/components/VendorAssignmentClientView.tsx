import StatusBadge from './ui/StatusBadge';

export interface ClientAssignedVendor {
  id: number;
  job_title: string;
  scope_of_work: string | null;
  status: string;
  notes?: string | null;
  vendor: {
    company_name: string;
    service_category: string;
  };
}

interface VendorAssignmentClientViewProps {
  assignments: ClientAssignedVendor[];
}

export default function VendorAssignmentClientView({
  assignments,
}: VendorAssignmentClientViewProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="p-10 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-900">Belum ada vendor yang ditugaskan pada event ini.</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Tim Event Organizer sedang memilih dan mengoordinasikan vendor terbaik untuk menangani kebutuhan acara Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((item) => (
        <div
          key={item.id}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{item.vendor.company_name}</h3>
              <span className="text-[11px] text-indigo-600 font-semibold">
                {item.vendor.service_category}
              </span>
            </div>
            <StatusBadge status={item.status} type="assignment" />
          </div>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Peran / Tugas: </span>
              <span className="text-slate-900 font-semibold">{item.job_title}</span>
            </div>

            {item.scope_of_work && (
              <p className="text-slate-600 text-[11px] line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <strong className="text-slate-700">Scope: </strong>
                {item.scope_of_work}
              </p>
            )}

            {item.notes && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                <strong className="text-slate-500">Progres Terkini: </strong>
                {item.notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
