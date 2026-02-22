import type { Staff, Assignment, TimeSlot } from '../types/shift';
import { getCalendarGridData } from '../lib/calendarNotation';

type Props = {
  staff: Staff[];
  slots: TimeSlot[];
  assignments: Assignment[];
  periodStart: string;
  periodEnd: string;
  onClose: () => void;
};

export function Preview({
  staff,
  slots,
  assignments,
  periodStart,
  periodEnd,
  onClose,
}: Props) {
  const grid = getCalendarGridData(periodStart, periodEnd, staff, slots, assignments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-end border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-300 no-print"
          >
            閉じる
          </button>
        </div>
        <div className="min-h-0 overflow-auto p-4 print-area">
          {grid ? (
            <>
              <h2 className="mb-3 text-base font-semibold text-slate-800 print:mb-2">
                シフト表
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th
                        rowSpan={2}
                        className="border border-slate-200 bg-slate-100 px-3 py-2 text-left font-medium align-middle"
                      >
                        {grid.periodLabel}
                      </th>
                      {grid.dates.map((d) => (
                        <th
                          key={d.date}
                          className="border border-slate-200 bg-slate-100 px-2 py-1.5 text-center font-medium"
                        >
                          {d.dayLabel}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {grid.dates.map((d) => (
                        <th
                          key={d.date}
                          className={`border border-slate-200 px-2 py-1 text-center text-xs font-medium ${
                            d.isSat ? 'bg-sky-100' : d.isSun ? 'bg-orange-100' : 'bg-slate-50'
                          }`}
                        >
                          {d.weekday}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.staffOrder.map((s) => (
                      <tr key={s.id}>
                        <td className="border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium">
                          {s.name}
                        </td>
                        {grid.dates.map((d) => (
                          <td
                            key={d.date}
                            className="border border-slate-200 px-2 py-1.5 text-center text-xs"
                          >
                            {grid.getCell(s.id, d.date)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {grid.staffOrder.length === 0 && (
                      <tr>
                        <td
                          colSpan={grid.dates.length + 1}
                          className="border border-slate-200 px-3 py-4 text-center text-slate-400"
                        >
                          シフトがありません。「ランダム生成」を実行してください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-slate-500">対象期間を選択してください。</p>
          )}
        </div>
      </div>
    </div>
  );
}
