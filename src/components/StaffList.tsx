import { useRef, useState } from 'react';
import type { Staff } from '../types/shift';
import { createId } from '../types/shift';
import { StaffEditModal } from './StaffEditModal';

type Props = {
  staff: Staff[];
  onChange: (staff: Staff[]) => void;
};

export function StaffList({ staff, onChange }: Props) {
  const [newName, setNewName] = useState('');
  const nameInputRef = useRef('');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const add = (openEditPopup = false) => {
    const name = (nameInputRef.current || newName).trim();
    nameInputRef.current = '';
    setNewName('');
    if (!name) return;
    const newStaff: Staff = {
      id: createId(),
      name,
      ngDates: [],
      category: '',
      role: '',
    };
    onChange([...staff, newStaff]);
    if (openEditPopup) setEditingStaff(newStaff);
  };

  const remove = (id: string) => {
    onChange(staff.filter((s) => s.id !== id));
    if (editingStaff?.id === id) setEditingStaff(null);
  };

  const updateStaff = (updated: Staff) => {
    onChange(staff.map((s) => (s.id === updated.id ? updated : s)));
    setEditingStaff(null);
  };

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">スタッフ</h2>
      <p className="mb-3 mt-1 text-sm text-slate-500">
        名前を追加し、編集で区別・担当・NG日を設定できます。
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
        <input
          type="text"
          placeholder="名前を入力"
          value={newName}
          onChange={(e) => {
            nameInputRef.current = e.target.value;
            setNewName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              add();
            }
          }}
          className="min-w-[8rem] rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => add(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-500"
        >
          追加
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {staff.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm text-slate-700"
          >
            <span className="min-w-0 truncate">{s.name}</span>
            <span className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setEditingStaff(s)}
                className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                title="区別・担当・NG日を編集"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label={`${s.name}を削除`}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>

      {editingStaff && (
        <StaffEditModal
          staff={editingStaff}
          onSave={updateStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}
    </section>
  );
}
