import { formatDateTimeIndo } from '@/lib/utils';
import EmptyState from './ui/EmptyState';

export interface ScheduleViewItem {
  id: number;
  title: string;
  description: string | null;
  start_time: Date | string;
  end_time: Date | string;
  pic_name: string | null;
  order_index: number;
}

interface RundownTimelineViewProps {
  schedules: ScheduleViewItem[];
  emptyMessage?: string;
}

function formatTimeOnly(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function RundownTimelineView({
  schedules,
  emptyMessage = 'Jadwal dan susunan rundown kegiatan belum ditentukan oleh Event Manager.',
}: RundownTimelineViewProps) {
  if (!schedules || schedules.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Susunan Rundown"
        description={emptyMessage}
        icon={
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  // Sort by order_index asc, then start_time asc
  const sorted = [...schedules].sort((a, b) => {
    if (a.order_index !== b.order_index) return a.order_index - b.order_index;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3.5 w-16 text-center">No</th>
              <th className="px-4 py-3.5 w-40">Waktu</th>
              <th className="px-6 py-3.5">Kegiatan & Rincian Sesi</th>
              <th className="px-4 py-3.5 w-48">PIC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((item, index) => {
              const numStr = String(item.order_index || index + 1).padStart(2, '0');
              const timeRange = `${formatTimeOnly(item.start_time)} - ${formatTimeOnly(item.end_time)}`;

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">
                    {numStr}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-900 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/80 text-xs">
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{timeRange}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item.pic_name ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {item.pic_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
