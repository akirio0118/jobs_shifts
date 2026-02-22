import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Staff, Assignment, TimeSlot } from '../types/shift';
import { getCalendarGridData } from './calendarNotation';

export function exportToExcel(
  staff: Staff[],
  slots: TimeSlot[],
  assignments: Assignment[],
  periodStart: string,
  periodEnd: string
): void {
  const wb = XLSX.utils.book_new();
  const grid = getCalendarGridData(periodStart, periodEnd, staff, slots, assignments);

  if (!grid || grid.dates.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['対象期間に日付がありません。']]);
    XLSX.utils.book_append_sheet(wb, ws, 'シフト表');
  } else {
    const header1 = [grid.periodLabel, ...grid.dates.map((d) => d.dayLabel)];
    const header2 = ['', ...grid.dates.map((d) => d.weekday)];
    const dataRows = grid.staffOrder.map((s) => [
      s.name,
      ...grid.dates.map((d) => grid.getCell(s.id, d.date)),
    ]);
    const sheetData = [header1, header2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'シフト表');
  }

  const filename = `シフト_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
