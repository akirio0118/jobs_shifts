export type Staff = {
  id: string;
  name: string;
  /** 出勤できない日（YYYY-MM-DD） */
  ngDates: string[];
  /** 区別（正社員 / パート / アルバイト など） */
  category?: string;
  /** 担当（在庫管理 / 品出し など） */
  role?: string;
};

/** 時間帯：名前・開始〜終了・必要な人数 */
export type TimeSlot = {
  id: string;
  name: string;
  start: string; // "09:00"
  end: string;   // "17:00"
  /** この時間帯に必要な人数 */
  required: number;
};

/** 1日・1時間帯・1人の割り当て */
export type Assignment = {
  date: string;   // YYYY-MM-DD
  slotId: string;
  staffId: string;
  /** 表示用の開始時刻オーバーライド（未設定ならスロットの開始） */
  startOverride?: string;
  /** 表示用の終了時刻オーバーライド（未設定ならスロットの終了） */
  endOverride?: string;
  /** 休み（その日は勤務なし） */
  isDayOff?: boolean;
};

export type ShiftState = {
  staff: Staff[];
  slots: TimeSlot[];
  assignments: Assignment[];
  periodStart: string;
  periodEnd: string;
};

export function createId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const DEFAULT_SLOTS: TimeSlot[] = [
  { id: 'default-1', name: '終日', start: '09:00', end: '17:00', required: 2 },
];
