import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Staff, Assignment, TimeSlot } from '../types/shift';

/**
 * 開始・終了を "HH:mm~HH:mm" 形式で返す。
 */
export function formatTimeRange(start: string, end: string): string {
  if (!start || !end || start === '—' || end === '—') return '';
  return `${start}~${end}`;
}

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

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "1日"
  weekday: string; // "月"
  weekdayShort: string; // "月"
  isSat: boolean;
  isSun: boolean;
};

export type CalendarGridData = {
  periodLabel: string;
  dates: CalendarDay[];
  staffOrder: Staff[];
  getCell: (staffId: string, date: string) => string;
};

/**
 * カレンダーグリッド用のデータを生成。
 * スタッフの並びは、期間中に1件でもアサインがある人を名前順で並べ、その後アサインのない人。
 */
export function getCalendarGridData(
  periodStart: string,
  periodEnd: string,
  staff: Staff[],
  slots: TimeSlot[],
  assignments: Assignment[]
): CalendarGridData | null {
  if (!periodStart || !periodEnd) return null;
  const dates = getDatesInRange(periodStart, periodEnd);
  if (dates.length === 0) return null;

  const dateObjs: CalendarDay[] = dates.map((d) => {
    const dt = parseISO(d);
    const dayNum = dt.getDate();
    const w = format(dt, 'E', { locale: ja });
    return {
      date: d,
      dayLabel: `${dayNum}日`,
      weekday: w,
      weekdayShort: w,
      isSat: dt.getDay() === 6,
      isSun: dt.getDay() === 0,
    };
  });

  const staffWithAssignments = new Set(assignments.map((a) => a.staffId));
  const staffOrder = [...staff].sort((a, b) => {
    const aHas = staffWithAssignments.has(a.id) ? 1 : 0;
    const bHas = staffWithAssignments.has(b.id) ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;
    return a.name.localeCompare(b.name);
  });

  const dayOffSet = new Set<string>();
  const assignmentByKey = new Map<string, { start: string; end: string }[]>();
  assignments.forEach((a) => {
    const key = `${a.staffId}:${a.date}`;
    if (a.isDayOff) {
      dayOffSet.add(key);
      return;
    }
    const slot = slots.find((s) => s.id === a.slotId);
    if (!slot) return;
    const list = assignmentByKey.get(key) ?? [];
    list.push({
      start: a.startOverride ?? slot.start,
      end: a.endOverride ?? slot.end,
    });
    assignmentByKey.set(key, list);
  });

  const getCell = (staffId: string, date: string): string => {
    const key = `${staffId}:${date}`;
    if (dayOffSet.has(key)) return '休み';
    const list = assignmentByKey.get(key);
    if (!list || list.length === 0) return '';
    return list.map((r) => formatTimeRange(r.start, r.end)).join(', ');
  };

  const startLabel = format(parseISO(periodStart), 'M/d', { locale: ja });
  const endLabel = format(parseISO(periodEnd), 'M/d', { locale: ja });
  const periodLabel = `${startLabel}~${endLabel}`;

  return { periodLabel, dates: dateObjs, staffOrder, getCell };
}
