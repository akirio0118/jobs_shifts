import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, addDays, format, parseISO } from 'date-fns';
import { TimeSlotsConfig } from './components/TimeSlotsConfig';
import { StaffList } from './components/StaffList';
import { PeriodSelect } from './components/PeriodSelect';
import { ShiftGrid } from './components/ShiftGrid';
import { Preview } from './components/Preview';
import { Layout } from './components/Layout';
import { exportToExcel } from './lib/excel';
import { generateAssignments } from './lib/generate';
import type { ShiftState, Staff, Assignment, TimeSlot } from './types/shift';
import { DEFAULT_SLOTS } from './types/shift';

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

const STORAGE_KEY = 'jobs_shifts_state';

function getDefaultPeriod() {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
  };
}

function migrateStaff(s: unknown): Staff {
  if (s && typeof s === 'object' && 'id' in s && 'name' in s) {
    const o = s as Record<string, unknown>;
    const ngDates = Array.isArray(o.ngDates) ? (o.ngDates as string[]) : [];
    const category = typeof o.category === 'string' ? o.category : '';
    const role = typeof o.role === 'string' ? o.role : '';
    return { id: String(o.id), name: String(o.name), ngDates, category, role };
  }
  return { id: '', name: '', ngDates: [], category: '', role: '' };
}

function migrateSlot(s: unknown): TimeSlot | null {
  if (s && typeof s === 'object' && 'id' in s && 'name' in s) {
    const o = s as Record<string, unknown>;
    const required = typeof o.required === 'number' && o.required >= 1 ? o.required : 1;
    return {
      id: String(o.id),
      name: String(o.name),
      start: typeof o.start === 'string' ? o.start : '09:00',
      end: typeof o.end === 'string' ? o.end : '17:00',
      required,
    };
  }
  return null;
}

function migrateAssignments(a: unknown, slots: TimeSlot[]): Assignment[] {
  if (!Array.isArray(a)) return [];
  const firstSlotId = slots[0]?.id;
  return a
    .filter((x) => x && typeof x === 'object' && 'date' in x && 'staffId' in x)
    .map((x) => {
      const o = x as Record<string, unknown>;
      const slotId = 'slotId' in o && typeof o.slotId === 'string' ? o.slotId : firstSlotId ?? '';
      const startOverride = typeof o.startOverride === 'string' ? o.startOverride : undefined;
      const endOverride = typeof o.endOverride === 'string' ? o.endOverride : undefined;
      const isDayOff = o.isDayOff === true;
      return {
        date: String(o.date),
        slotId,
        staffId: String(o.staffId),
        ...(startOverride && { startOverride }),
        ...(endOverride && { endOverride }),
        ...(isDayOff && { isDayOff: true }),
      };
    })
    .filter((x) => x.slotId);
}

function loadState(): Partial<ShiftState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const staff = Array.isArray(parsed.staff) ? parsed.staff.map(migrateStaff) : undefined;
      const slotsRaw = Array.isArray(parsed.slots) ? parsed.slots : undefined;
      const slots = slotsRaw?.map(migrateSlot).filter((s): s is TimeSlot => s != null) ?? undefined;
      const finalSlots = slots && slots.length > 0 ? slots : DEFAULT_SLOTS;
      const assignments = migrateAssignments(parsed.assignments, finalSlots);
      return {
        staff,
        slots: slots && slots.length > 0 ? slots : undefined,
        assignments: assignments.length > 0 ? assignments : undefined,
        periodStart: typeof parsed.periodStart === 'string' ? parsed.periodStart : undefined,
        periodEnd: typeof parsed.periodEnd === 'string' ? parsed.periodEnd : undefined,
      };
    }
  } catch {
    // ignore
  }
  return {};
}

function saveState(state: ShiftState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getInitialState() {
  const def = getDefaultPeriod();
  const loaded = loadState();
  return {
    staff: loaded.staff ?? [],
    slots: loaded.slots && loaded.slots.length > 0 ? loaded.slots : DEFAULT_SLOTS,
    assignments: loaded.assignments ?? [],
    periodStart: loaded.periodStart ?? def.periodStart,
    periodEnd: loaded.periodEnd ?? def.periodEnd,
  };
}

export default function App() {
  const [initial] = useState(getInitialState);
  const [staff, setStaff] = useState<Staff[]>(initial.staff);
  const [slots, setSlots] = useState<TimeSlot[]>(initial.slots);
  const [assignments, setAssignments] = useState<Assignment[]>(initial.assignments);
  const [periodStart, setPeriodStart] = useState(initial.periodStart);
  const [periodEnd, setPeriodEnd] = useState(initial.periodEnd);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    saveState({
      staff,
      slots,
      assignments,
      periodStart,
      periodEnd,
    });
  }, [staff, slots, assignments, periodStart, periodEnd]);

  const handlePeriodChange = (start: string, end: string) => {
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const handleExportExcel = () => {
    exportToExcel(staff, slots, assignments, periodStart, periodEnd);
  };

  const handleRandomGenerate = () => {
    if (!periodStart || !periodEnd || staff.length === 0) return;
    const next = generateAssignments(periodStart, periodEnd, staff, slots);
    const dates = getDatesInRange(periodStart, periodEnd);
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
    setAssignments(withDayOff);
  };

  const handleScrollToStaff = () => {
    document.getElementById('staff-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScrollToPeriod = () => {
    document.getElementById('period-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleScrollToShift = () => {
    document.getElementById('shift-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const periodDays =
    periodStart && periodEnd ? getDatesInRange(periodStart, periodEnd).length : 0;
  const assignmentCount = assignments.filter((a) => !a.isDayOff).length;
  const dayOffCount = assignments.filter((a) => a.isDayOff).length;

  return (
    <Layout
      onAddStaff={handleScrollToStaff}
      onScrollToPeriod={handleScrollToPeriod}
      onScrollToShift={handleScrollToShift}
      staffCount={staff.length}
      periodDays={periodDays}
      assignmentCount={assignmentCount}
      dayOffCount={dayOffCount}
    >
      <section
        className="mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
        aria-label="このツールについて"
      >
        <h2 className="sr-only">このツールについて</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          スタッフとNG日を登録し、必要人数を設定して<strong>ランダム生成</strong>。表で時間・休みを編集し、<strong>Excel出力</strong>までブラウザで完結する無料ツールです。
        </p>
        <p className="mt-2 text-xs text-slate-500">
          入力内容はお使いのブラウザに自動保存されます。同じ端末・同じブラウザで開くと前回のデータが復元されます。
        </p>
      </section>

      <div id="period-section" className="mb-6">
        <PeriodSelect
          periodStart={periodStart}
          periodEnd={periodEnd}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      <div className="flex flex-col gap-6">
        <TimeSlotsConfig slots={slots} onChange={setSlots} />
        <div id="staff-section">
          <StaffList staff={staff} onChange={setStaff} />
        </div>
      </div>

      <div id="shift-section" className="mt-6">
        <ShiftGrid
          staff={staff}
          slots={slots}
          assignments={assignments}
          periodStart={periodStart}
          periodEnd={periodEnd}
          onAssignmentsChange={setAssignments}
          onGenerate={handleRandomGenerate}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 no-print">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          プレビュー
        </button>
        <button
          type="button"
          onClick={handleExportExcel}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-500"
        >
          Excelでダウンロード
        </button>
      </div>

      {showPreview && (
        <Preview
          staff={staff}
          slots={slots}
          assignments={assignments}
          periodStart={periodStart}
          periodEnd={periodEnd}
          onClose={() => setShowPreview(false)}
        />
      )}
    </Layout>
  );
}
