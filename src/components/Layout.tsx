import { useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAddStaff: () => void;
  onScrollToPeriod?: () => void;
  onScrollToShift?: () => void;
  staffCount: number;
  periodDays: number;
  assignmentCount: number;
  dayOffCount: number;
};

export function Layout({
  children,
  onAddStaff,
  onScrollToPeriod,
  onScrollToShift,
  staffCount,
  periodDays,
  assignmentCount,
  dayOffCount,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* 左サイドバー */}
      <aside
        className={`flex shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-200 ${
          sidebarOpen ? 'w-56' : 'w-14'
        }`}
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex min-h-[2rem] items-center justify-between gap-1.5 overflow-hidden">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-violet-600">シフト</span>
                  <span className="text-xl font-bold text-teal-500">表</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="サイドバーを閉じる"
                >
                  <span className="text-lg">‹</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex w-full justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="サイドバーを開く"
              >
                <span className="text-xl">›</span>
              </button>
            )}
          </div>
        </div>
        {sidebarOpen && (
          <>
            <nav className="flex-1 px-3 py-2" aria-label="メイン">
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    onClick={onAddStaff}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <span className="text-slate-400">👤</span>
                    スタッフを追加
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onScrollToPeriod?.()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <span className="text-slate-400">📆</span>
                    対象期間
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onScrollToShift?.()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <span className="text-slate-400">📅</span>
                    シフト表
                  </button>
                </li>
              </ul>
            </nav>
            <div className="border-t border-slate-100 px-3 py-3">
              <a
                href={
                  import.meta.env.VITE_X_DM_URL ||
                  import.meta.env.VITE_X_PROFILE_URL ||
                  'https://x.com/akihirod7oa'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              >
                <span className="text-slate-400">💬</span>
                フィードバック
              </a>
            </div>
          </>
        )}
      </aside>

      {/* メインエリア */}
      <div className="flex-1 overflow-auto">
        {/* トップバー */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">シフト表 作成</h1>
        </header>

        <main className="p-6">
          {/* KPIカード */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <span className="text-lg">👤</span>
                </div>
                <span className="text-slate-300">⋯</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{staffCount}</p>
              <p className="text-xs font-medium text-slate-500">スタッフ数</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <span className="text-lg">📅</span>
                </div>
                <span className="text-slate-300">⋯</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{periodDays}</p>
              <p className="text-xs font-medium text-slate-500">対象日数</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <span className="text-lg">✓</span>
                </div>
                <span className="text-slate-300">⋯</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{assignmentCount}</p>
              <p className="text-xs font-medium text-slate-500">割り当て数</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <span className="text-lg">休</span>
                </div>
                <span className="text-slate-300">⋯</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">{dayOffCount}</p>
              <p className="text-xs font-medium text-slate-500">休み数</p>
            </div>
          </div>

          {children}

          <footer className="mt-10 border-t border-slate-200 pt-4 text-center">
            <a
              href="/licenses.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              利用ライセンス
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
