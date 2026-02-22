import { addDays, format, parseISO } from 'date-fns';
import type { Staff, Assignment, TimeSlot } from '../types/shift';

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

/** シャッフル（Fisher-Yates） */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 各日・各時間帯について、必要な人数だけランダムに割り当てる。
 * 1人1日1時間帯まで（同じ日に別の時間帯には割り当てない）。
 */
export function generateAssignments(
  periodStart: string,
  periodEnd: string,
  staff: Staff[],
  slots: TimeSlot[]
): Assignment[] {
  const dates = getDatesInRange(periodStart, periodEnd);
  const result: Assignment[] = [];

  for (const date of dates) {
    let available = staff.filter((s) => !s.ngDates.includes(date));
    for (const slot of slots) {
      const shuffled = shuffle(available);
      const pick = shuffled.slice(0, slot.required);
      for (const s of pick) {
        result.push({ date, slotId: slot.id, staffId: s.id });
      }
      available = available.filter((s) => !pick.includes(s));
    }
  }

  return result;
}
