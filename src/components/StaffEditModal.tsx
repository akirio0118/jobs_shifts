import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Staff } from '../types/shift';

const CATEGORY_OPTIONS = ['正社員', 'パート', 'アルバイト', 'その他'];

type Props = {
  staff: Staff;
  onSave: (staff: Staff) => void;
  onClose: () => void;
};

export function StaffEditModal({ staff, onSave, onClose }: Props) {
  const [category, setCategory] = useState(staff.category ?? '');
  const [role, setRole] = useState(staff.role ?? '');
  const [ngDates, setNgDates] = useState<string[]>(() =>
    Array.isArray(staff.ngDates) ? [...staff.ngDates].sort() : []
  );
  const [newDate, setNewDate] = useState('');

  const addDate = () => {
    if (!newDate) return;
    if (ngDates.includes(newDate)) return;
    setNgDates((prev) => [...prev, newDate].sort());
    setNewDate('');
  };

  const removeDate = (date: string) => {
    setNgDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = () => {
    onSave({
      ...staff,
      category: category.trim() || undefined,
      role: role.trim() || undefined,
      ngDates,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-xl bg-white p-4 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">{staff.name} を編集</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">区別</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">担当</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="例: 在庫管理、品出し"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">NG日</label>
            <p className="mb-2 text-xs text-slate-500">出勤できない日を追加してください。</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={addDate}
                className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300"
              >
                追加
              </button>
            </div>
            <ul className="mt-2 max-h-40 overflow-auto">
              {ngDates.map((d) => (
                <li
                  key={d}
                  className="flex items-center justify-between rounded border border-slate-100 py-1 pl-2 pr-1 text-sm"
                >
                  {format(parseISO(d), 'yyyy年M月d日 (E)', { locale: ja })}
                  <button
                    type="button"
                    onClick={() => removeDate(d)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    ×
                  </button>
                </li>
              ))}
              {ngDates.length === 0 && (
                <li className="py-2 text-sm text-slate-400">NG日はありません</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
