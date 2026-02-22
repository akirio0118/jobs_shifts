# アルバイト シフト作成

1勤務・2勤務・3勤務の時間帯を設定し、複数スタッフのシフトを表で割り当てて、プレビュー・Excel 出力できる Web アプリです。

## 技術

- React 18 + TypeScript + Vite
- Tailwind CSS
- date-fns（日付）
- xlsx（Excel 出力）

## 開発

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## ビルド

```bash
npm run build
```

成果物は `dist/` に出力されます。

## Vercel でデプロイ

1. リポジトリを GitHub などに push
2. [Vercel](https://vercel.com) で「Import Project」→ リポジトリを選択
3. ルートディレクトリは `jobs_shifts`（このフォルダがルートの場合はそのまま）
4. ビルドコマンド: `npm run build`、出力: `dist`（自動検出される想定）
5. Deploy

`vercel.json` で SPA 用のリライトを設定済みです。

## 機能

- **勤務時間帯**: 1勤務・2勤務・3勤務の開始・終了時刻を変更可能
- **スタッフ**: 名前を追加・削除（複数人）
- **対象期間**: 今週 / 来週 で選択
- **シフト表**: 日付×スタッフで各セルに 1/2/3勤務 または未定を選択
- **プレビュー**: モーダルで表形式のプレビュー（印刷イメージ）
- **Excel**: 「Excelでダウンロード」で .xlsx をダウンロード（勤務時間帯シート + シフト表シート）

設定・シフトはブラウザの localStorage に保存され、再訪問時も復元されます。
