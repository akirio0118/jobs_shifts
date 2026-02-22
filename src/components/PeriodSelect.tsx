import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';

type Props = {
  periodStart: string;
  periodEnd: string;
  onPeriodChange: (start: string, end: string) => void;
};

function toYMD(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function PeriodSelect({ periodStart, periodEnd, onPeriodChange }: Props) {
  const base = periodStart ? new Date(periodStart + 'T12:00:00') : new Date();
  const thisWeekStart = startOfWeek(base, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(base, { weekStartsOn: 1 });
  const nextWeekStart = addWeeks(thisWeekStart, 1);
  const nextWeekEnd = addWeeks(thisWeekEnd, 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-800">対象期間</h2>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">開始日</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => onPeriodChange(e.target.value, periodEnd)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">終了日</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => onPeriodChange(periodStart, e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPeriodChange(toYMD(thisWeekStart), toYMD(thisWeekEnd))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            今週
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange(toYMD(nextWeekStart), toYMD(nextWeekEnd))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            来週
          </button>
        </div>
      </div>
      {periodStart && periodEnd && (
        <p className="mt-2 text-sm text-slate-500">
          {format(new Date(periodStart + 'T12:00:00'), 'yyyy年M月d日', { locale: ja })} 〜{' '}
          {format(new Date(periodEnd + 'T12:00:00'), 'yyyy年M月d日', { locale: ja })}
        </p>
      )}
    </section>
  );
}
