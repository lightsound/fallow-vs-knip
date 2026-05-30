// 実際の CLI 出力を模した擬似ログ。README の例とツールの役割に基づく説明用。
// kind で色分けする。prompt は実際に叩くコマンド行。

export type LineKind =
  | "prompt"
  | "heading"
  | "error"
  | "warn"
  | "ok"
  | "info"
  | "dim";

export type TerminalLine = { kind: LineKind; text: string };

export type TerminalScript = {
  tool: "knip" | "fallow";
  command: string;
  lines: TerminalLine[];
  takeaway: string;
};

export const knipScript: TerminalScript = {
  tool: "knip",
  command: "npx knip",
  lines: [
    { kind: "prompt", text: "$ npx knip" },
    { kind: "heading", text: "Unused files (2)" },
    { kind: "error", text: "src/legacy/format-date.ts" },
    { kind: "error", text: "src/hooks/useDeprecatedModal.ts" },
    { kind: "heading", text: "Unused dependencies (3)" },
    { kind: "error", text: "lodash.merge          package.json" },
    { kind: "error", text: "date-fns              package.json" },
    { kind: "error", text: "react-helmet          package.json" },
    { kind: "heading", text: "Unused exports (4)" },
    { kind: "error", text: "formatCurrency  src/utils/money.ts:12:14" },
    { kind: "error", text: "PaletteToken    src/theme/tokens.ts:5:13" },
    { kind: "dim", text: "" },
    { kind: "info", text: "✓ 完了: 1.95s（svelte 3,337 files / knip v5）" },
  ],
  takeaway: "knip は「未使用」を列挙してくれる。だが重複・複雑度・アーキテクチャは範囲外。",
};

export const fallowScript: TerminalScript = {
  tool: "fallow",
  command: "npx fallow audit",
  lines: [
    { kind: "prompt", text: "$ npx fallow audit" },
    { kind: "dim", text: "Audit scope: 7 changed files vs main" },
    { kind: "dim", text: "" },
    { kind: "heading", text: "-- Dead Code ---------------------------------------" },
    { kind: "error", text: "x 7 unused dependencies · 14 dev/optional deps" },
    { kind: "dim", text: "  21 issues · 1 suppressed · 0 stale suppressions" },
    { kind: "dim", text: "" },
    { kind: "heading", text: "-- Duplication -------------------------------------" },
    { kind: "error", text: "x 3 clone families touching changed files" },
    { kind: "dim", text: "" },
    { kind: "heading", text: "-- Complexity --------------------------------------" },
    { kind: "warn", text: "! 2 changed functions above threshold" },
    { kind: "dim", text: "" },
    { kind: "heading", text: "-- Architecture ------------------------------------" },
    { kind: "warn", text: "! 1 boundary violation: ui → infra（layered preset）" },
    { kind: "dim", text: "" },
    { kind: "heading", text: "-- Verdict -----------------------------------------" },
    { kind: "error", text: "FAIL · health 78/100 · exit 1" },
    { kind: "ok", text: "✓ 完了: 363ms（svelte 3,337 files）— 5x faster" },
  ],
  takeaway:
    "fallow は同じスキャンで デッドコード＋重複＋複雑度＋アーキ境界＋PR判定 を一度に返す。",
};
