import type { TimeSlot } from '../types/shift';
import { createId } from '../types/shift';

type Props = {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
};

export function TimeSlotsConfig({ slots, onChange }: Props) {
  const update = (id: string, field: keyof TimeSlot, value: string | number) => {
    onChange(
      slots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const add = () => {
    onChange([
      ...slots,
      { id: createId(), name: '新しい時間帯', start: '09:00', end: '17:00', required: 1 },
    ]);
  };

  const remove = (id: string) => {
    if (slots.length <= 1) return;
    onChange(slots.filter((s) => s.id !== id));
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">時間帯と必要な人数</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-500"
        >
          時間帯を追加
        </button>
      </div>
      <p className="mb-3 text-sm text-slate-500">
        各時間帯で必要な人数を設定し、ランダム生成で割り当てます。表で微調整もできます。
      </p>
      <div className="space-y-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
          >
            <input
              type="text"
              value={slot.name}
              onChange={(e) => update(slot.id, 'name', e.target.value)}
              placeholder="名前（例: 午前）"
              className="w-24 rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="time"
              value={slot.start}
              onChange={(e) => update(slot.id, 'start', e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <span className="text-slate-400">〜</span>
            <input
              type="time"
              value={slot.end}
              onChange={(e) => update(slot.id, 'end', e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <span className="text-slate-500">必要</span>
            <input
              type="number"
              min={1}
              max={20}
              value={slot.required}
              onChange={(e) =>
                update(slot.id, 'required', Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-14 rounded border border-slate-300 px-2 py-1.5 text-sm text-center"
            />
            <span className="text-slate-500">人</span>
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => remove(slot.id)}
                className="ml-auto rounded px-2 py-1 text-sm text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                削除
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
