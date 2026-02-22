import type { Staff, Assignment, TimeSlot } from '../types/shift';

/** 1日分の「左表」1行（区別・氏名・担当・開始・終了） */
export type DailyRow = {
  staffId: string;
  category: string;
  name: string;
  role: string;
  start: string; // "09:00"
  end: string;   // "17:00"
};

/**
 * 指定日のアサインから、シフト表の左側の行リストを生成する。
 * 表示順: 開始時間の昇順 → 区別 → 氏名。
 */
export function getDailyRows(
  date: string,
  staff: Staff[],
  slots: TimeSlot[],
  assignments: Assignment[]
): DailyRow[] {
  const dayAssignments = assignments.filter((a) => a.date === date);
  const rows: DailyRow[] = dayAssignments.map((a) => {
    const s = staff.find((x) => x.id === a.staffId);
    const slot = slots.find((x) => x.id === a.slotId);
    return {
      staffId: a.staffId,
      category: s?.category ?? '—',
      name: s?.name ?? '—',
      role: s?.role ?? '—',
      start: slot?.start ?? '—',
      end: slot?.end ?? '—',
    };
  });
  rows.sort((a, b) => {
    const timeA = a.start;
    const timeB = b.start;
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
  return rows;
}

/** 時間軸: 5〜24時（1時間刻み） */
export const TIMELINE_HOURS = Array.from({ length: 20 }, (_, i) => i + 5); // 5..24

/** "09:00" のような文字列から時間（0-24）を取得。5 → 5時, 24 → 24時扱い */
export function hourFromTime(timeStr: string): number {
  if (!timeStr || timeStr === '—') return -1;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h)) return -1;
  return h + (m ? m / 60 : 0);
}

/** 指定時間が [start, end) の範囲に含まれるか（時間は 5〜24 の数値） */
export function isHourInRange(hour: number, startStr: string, endStr: string): boolean {
  const start = hourFromTime(startStr);
  const end = hourFromTime(endStr);
  if (start < 0 || end < 0) return false;
  return hour >= Math.floor(start) && hour < Math.ceil(end);
}
