// fallow / knip の生出力を、UI が扱う統一 Finding 形に正規化する。
// 同じ正規化を「fixture（既定）」「ライブ実行(/api/analyze)」の両経路で使い、表示の一貫性を担保する。

import { analysisFixtures } from "../data/analysisFixtures.ts";

export type Tool = "fallow" | "knip";

export type FindingCategory =
  | "unused-file"
  | "unused-export"
  | "unused-dependency"
  | "duplication"
  | "circular-dependency"
  | "complexity";

export type Finding = {
  tool: Tool;
  category: FindingCategory;
  file: string;
  line?: number;
  endLine?: number;
  symbol?: string;
  message: string;
  detail?: string;
  relatedFiles?: string[];
};

export type CategoryMeta = {
  label: string;
  /** fallow のみが検出できる高度カテゴリ（knip では原理的に出ない）。 */
  advanced: boolean;
};

export const CATEGORY_ORDER: FindingCategory[] = [
  "unused-file",
  "unused-export",
  "unused-dependency",
  "duplication",
  "circular-dependency",
  "complexity",
];

export const CATEGORY_META: Record<FindingCategory, CategoryMeta> = {
  "unused-file": { label: "未使用ファイル", advanced: false },
  "unused-export": { label: "未使用 export", advanced: false },
  "unused-dependency": { label: "未使用 dependency", advanced: false },
  duplication: { label: "重複コード", advanced: true },
  "circular-dependency": { label: "循環依存", advanced: true },
  complexity: { label: "複雑度ホットスポット", advanced: true },
};

// ---- 生出力の型（正規化が参照するフィールドのみ） ----

export interface FallowRaw {
  check: {
    unused_files: { path: string }[];
    unused_exports: { path: string; export_name: string; line?: number }[];
    unused_dependencies: { package_name: string; line?: number }[];
    circular_dependencies: { files: string[]; line?: number }[];
  };
  dupes: {
    clone_groups: {
      instances: { file: string; start_line: number; end_line: number }[];
    }[];
  };
  health: {
    findings: {
      path: string;
      name: string;
      line?: number;
      cyclomatic?: number;
      cognitive?: number;
      crap?: number;
      severity?: string;
    }[];
  };
  elapsed_ms?: number;
}

export interface KnipRaw {
  issues: {
    file: string;
    files: { name: string }[];
    exports: { name: string; line?: number }[];
    types: { name: string; line?: number }[];
    dependencies: { name: string; line?: number }[];
    devDependencies: { name: string; line?: number }[];
    duplicates: { name: string; line?: number }[];
  }[];
}

const base = (p: string) => p.split("/").pop() ?? p;

// ---- 正規化 ----

export function normalizeFallow(raw: FallowRaw): Finding[] {
  const out: Finding[] = [];
  const tool = "fallow" as const;

  for (const f of raw.check.unused_files) {
    out.push({
      tool,
      category: "unused-file",
      file: f.path,
      message: "どこからも import されていない未使用ファイル",
    });
  }
  for (const e of raw.check.unused_exports) {
    out.push({
      tool,
      category: "unused-export",
      file: e.path,
      line: e.line,
      symbol: e.export_name,
      message: `未使用の export: ${e.export_name}`,
    });
  }
  for (const d of raw.check.unused_dependencies) {
    out.push({
      tool,
      category: "unused-dependency",
      file: "package.json",
      line: d.line,
      symbol: d.package_name,
      message: `未使用の依存: ${d.package_name}`,
    });
  }
  for (const c of raw.check.circular_dependencies) {
    const cycle = [...c.files.map(base), base(c.files[0] ?? "")].join(" → ");
    for (const file of c.files) {
      out.push({
        tool,
        category: "circular-dependency",
        file,
        line: c.line ?? 1,
        relatedFiles: c.files.filter((x) => x !== file),
        message: `循環依存: ${cycle}`,
      });
    }
  }
  for (const g of raw.dupes.clone_groups) {
    const files = g.instances.map((i) => i.file);
    for (const inst of g.instances) {
      const lines = inst.end_line - inst.start_line + 1;
      out.push({
        tool,
        category: "duplication",
        file: inst.file,
        line: inst.start_line,
        endLine: inst.end_line,
        relatedFiles: files.filter((x) => x !== inst.file),
        message: `重複コード（${lines} 行 × ${g.instances.length} 箇所）`,
      });
    }
  }
  for (const h of raw.health.findings) {
    if (h.severity && h.severity === "none") continue;
    const metrics = [
      h.cyclomatic != null ? `cyclomatic ${h.cyclomatic}` : null,
      h.cognitive != null ? `cognitive ${h.cognitive}` : null,
      h.crap != null ? `CRAP ${h.crap}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    out.push({
      tool,
      category: "complexity",
      file: h.path,
      line: h.line,
      symbol: h.name,
      detail: metrics,
      message: `複雑度が高い関数: ${h.name}${h.severity ? `（${h.severity}）` : ""}`,
    });
  }
  return out;
}

export function normalizeKnip(raw: KnipRaw): Finding[] {
  const out: Finding[] = [];
  const tool = "knip" as const;

  for (const issue of raw.issues) {
    for (const _ of issue.files) {
      out.push({
        tool,
        category: "unused-file",
        file: issue.file,
        message: "どこからも import されていない未使用ファイル",
      });
    }
    for (const e of [...issue.exports, ...issue.types]) {
      out.push({
        tool,
        category: "unused-export",
        file: issue.file,
        line: e.line,
        symbol: e.name,
        message: `未使用の export: ${e.name}`,
      });
    }
    for (const d of [...issue.dependencies, ...issue.devDependencies]) {
      out.push({
        tool,
        category: "unused-dependency",
        file: "package.json",
        line: d.line,
        symbol: d.name,
        message: `未使用の依存: ${d.name}`,
      });
    }
    for (const d of issue.duplicates) {
      out.push({
        tool,
        category: "duplication",
        file: issue.file,
        symbol: d.name,
        message: `重複: ${d.name}`,
      });
    }
  }
  return out;
}

// ---- 実行（ライブ → 失敗時 fixture フォールバック） ----

export type AnalysisSource = "live" | "fixture";

export type AnalysisResult = {
  tool: Tool;
  findings: Finding[];
  cli: string;
  elapsedMs: number;
  source: AnalysisSource;
};

function fromFixture(tool: Tool): AnalysisResult {
  const fx = analysisFixtures[tool];
  const findings =
    tool === "fallow"
      ? normalizeFallow(fx.raw as FallowRaw)
      : normalizeKnip(fx.raw as KnipRaw);
  return { tool, findings, cli: fx.cli, elapsedMs: fx.elapsedMs, source: "fixture" };
}

// ライブ実行(Vercel Function)は fallow のみ対応。
// fallow は構文解析のみで install/依存解決が不要なため、サーバーレス上でそのまま走る。
// knip は import 解決に「インストール済みプロジェクト」を要するため、ここでは決定的な
// 実キャプチャ(fixture)を表示する（= fallow の優位点そのもの）。
export const LIVE_CAPABLE: Record<Tool, boolean> = { fallow: true, knip: false };

export async function runAnalysis(
  tool: Tool,
  opts: { live: boolean },
): Promise<AnalysisResult> {
  if (opts.live && LIVE_CAPABLE[tool]) {
    try {
      const res = await fetch(`/api/analyze?tool=${tool}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as {
        raw: FallowRaw | KnipRaw;
        cli: string;
        elapsedMs: number;
      };
      const findings =
        tool === "fallow"
          ? normalizeFallow(data.raw as FallowRaw)
          : normalizeKnip(data.raw as KnipRaw);
      // CLI の整形テキストは決定的なので、ライブが返さない場合はキャプチャ済みの実出力を使う。
      const cli = data.cli && data.cli.trim() ? data.cli : analysisFixtures[tool].cli;
      return { tool, findings, cli, elapsedMs: data.elapsedMs, source: "live" };
    } catch {
      // ライブ実行に失敗したら fixture にフォールバック（デモは止めない）
      return fromFixture(tool);
    }
  }
  return fromFixture(tool);
}
