import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Staff, Assignment, TimeSlot } from '../types/shift';
import { generateAssignments } from '../lib/generate';

type Props = {
  staff: Staff[];
  slots: TimeSlot[];
  assignments: Assignment[];
  periodStart: string;
  periodEnd: string;
  onAssignmentsChange: (assignments: Assignment[]) => void;
  onGenerate?: () => void;
};

function getDatesInRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = parseISO(start);
  const endD = parseISO(end);
  let cur = d;
  while (cur <= endD) {
    out.push(format(cur, 'yyyy-MM-dd'));
    cur = addDays(cur, 1);
  }
  return out;
}

function getStartEnd(a: Assignment, slots: TimeSlot[]): { start: string; end: string } {
  const slot = slots.find((s) => s.id === a.slotId);
  return {
    start: a.startOverride ?? slot?.start ?? '09:00',
    end: a.endOverride ?? slot?.end ?? '17:00',
  };
}

export function ShiftGrid({
  staff,
  slots,
  assignments,
  periodStart,
  periodEnd,
  onAssignmentsChange,
  onGenerate,
}: Props) {
  const dates = periodStart && periodEnd ? getDatesInRange(periodStart, periodEnd) : [];

  /** その人・その日のアサイン一覧 */
  const getAssignmentsFor = (staffId: string, date: string) =>
    assignments.filter((a) => a.staffId === staffId && a.date === date);

  const addAssignment = (staffId: string, date: string, slotId: string) => {
    onAssignmentsChange([...assignments, { date, slotId, staffId }]);
  };

  const removeAssignment = (date: string, slotId: string, staffId: string) => {
    onAssignmentsChange(
      assignments.filter(
        (a) => !(a.date === date && a.slotId === slotId && a.staffId === staffId)
      )
    );
  };

  /** その日を休みにする（既存の時間は削除） */
  const setDayOff = (staffId: string, date: string) => {
    const rest = assignments.filter(
      (a) => !(a.staffId === staffId && a.date === date)
    );
    const slotId = slots[0]?.id ?? '';
    onAssignmentsChange([
      ...rest,
      { date, staffId, slotId, isDayOff: true },
    ]);
  };

  /** 休みを解除する */
  const clearDayOff = (staffId: string, date: string) => {
    onAssignmentsChange(
      assignments.filter(
        (a) => !(a.staffId === staffId && a.date === date && a.isDayOff)
      )
    );
  };

  const updateAssignmentTime = (
    date: string,
    slotId: string,
    staffId: string,
    start: string,
    end: string
  ) => {
    const slot = slots.find((s) => s.id === slotId);
    const defaultStart = slot?.start ?? '09:00';
    const defaultEnd = slot?.end ?? '17:00';
    onAssignmentsChange(
      assignments.map((a) => {
        if (a.date !== date || a.slotId !== slotId || a.staffId !== staffId) return a;
        return {
          ...a,
          startOverride: start !== defaultStart ? start : undefined,
          endOverride: end !== defaultEnd ? end : undefined,
        };
      })
    );
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate();
      return;
    }
    const next = generateAssignments(periodStart, periodEnd, staff, slots);
    const slotIdForDayOff = slots[0]?.id ?? '';
    const withDayOff: Assignment[] = [...next];
    dates.forEach((date) => {
      staff.forEach((s) => {
        const hasAny = next.some((a) => a.staffId === s.id && a.date === date);
        if (!hasAny) {
          withDayOff.push({
            date,
            staffId: s.id,
            slotId: slotIdForDayOff,
            isDayOff: true,
          });
        }
      });
    });
    onAssignmentsChange(withDayOff);
  };

  if (!periodStart || !periodEnd) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">シフト表</h2>
        <p className="text-sm text-slate-500">対象期間を選択してください。</p>
      </section>
    );
  }

  if (staff.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">シフト表</h2>
        <p className="text-sm text-slate-500">スタッフを追加してください。</p>
      </section>
    );
  }

  if (slots.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">シフト表</h2>
        <p className="text-sm text-slate-500">時間帯を設定してください。</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">シフト表</h2>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          ランダム生成
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        縦軸＝人、横軸＝日付。各セルでその人のその日の時間を追加・編集できます。
      </p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left font-semibold text-slate-700">
                氏名
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  className="min-w-[120px] border-b border-l border-slate-200 bg-slate-50 px-2 py-3 text-center font-semibold text-slate-700"
                >
                  <span className="block">{format(parseISO(d), 'M/d', { locale: ja })}</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    {format(parseISO(d), 'E', { locale: ja })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s, rowIndex) => (
              <tr
                key={s.id}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
              >
                <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-3 py-2 font-medium text-slate-800">
                  {s.name}
                </td>
                {dates.map((date) => {
                  const list = getAssignmentsFor(s.id, date);
                  const dayOff = list.find((a) => a.isDayOff);
                  const timeList = list.filter((a) => !a.isDayOff);
                  const availableSlots = slots.filter(
                    (slot) => !timeList.some((a) => a.slotId === slot.id)
                  );
                  return (
                    <td
                      key={date}
                      className="min-w-[120px] border-b border-l border-slate-200 px-2 py-2 align-top"
                    >
                      <div className="space-y-2">
                        {dayOff ? (
                          <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-center">
                            <span className="text-sm font-medium text-amber-800">休み</span>
                            <button
                              type="button"
                              onClick={() => clearDayOff(s.id, date)}
                              className="mt-1 block w-full rounded border border-amber-200 bg-white py-0.5 text-xs text-amber-700 hover:bg-amber-100"
                            >
                              解除
                            </button>
                          </div>
                        ) : (
                          <>
                            {timeList.map((a) => {
                              const { start, end } = getStartEnd(a, slots);
                              const slot = slots.find((sl) => sl.id === a.slotId);
                              return (
                                <div
                                  key={a.slotId}
                                  className="rounded-md border border-slate-100 bg-white p-1.5 shadow-sm"
                                >
                                  <div className="mb-1 flex items-center justify-end gap-0.5">
                                    {slot && (
                                      <span className="mr-auto text-[10px] text-slate-400">
                                        {slot.name}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeAssignment(date, a.slotId, s.id)}
                                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                      aria-label="削除"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <input
                                      type="time"
                                      value={start}
                                      onChange={(e) =>
                                        updateAssignmentTime(
                                          date,
                                          a.slotId,
                                          s.id,
                                          e.target.value,
                                          end
                                        )
                                      }
                                      className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-xs"
                                    />
                                    <span className="shrink-0 text-slate-400">~</span>
                                    <input
                                      type="time"
                                      value={end}
                                      onChange={(e) =>
                                        updateAssignmentTime(
                                          date,
                                          a.slotId,
                                          s.id,
                                          start,
                                          e.target.value
                                        )
                                      }
                                      className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-xs"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {availableSlots.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  const slotId = e.target.value;
                                  if (slotId) addAssignment(s.id, date, slotId);
                                  e.target.value = '';
                                }}
                                className="w-full rounded border border-dashed border-slate-200 bg-slate-50/50 px-1.5 py-1 text-xs text-slate-500 hover:border-slate-300"
                              >
                                <option value="">+ 時間を追加</option>
                                {availableSlots.map((slot) => (
                                  <option key={slot.id} value={slot.id}>
                                    {slot.name} ({slot.start}〜{slot.end})
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              onClick={() => setDayOff(s.id, date)}
                              className="w-full rounded border border-dashed border-slate-200 py-1 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                            >
                              休みにする
                            </button>
                          </>
                        )}
                        {!dayOff && timeList.length === 0 && availableSlots.length === 0 && (
                          <span className="block py-1 text-center text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
