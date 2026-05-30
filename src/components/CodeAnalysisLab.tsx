import { useState } from "react";
import { sampleFiles } from "../data/sample.ts";
import {
  runAnalysis,
  type AnalysisResult,
  type Finding,
  type Tool,
} from "../lib/analysis.ts";
import { CodeViewer } from "./CodeViewer.tsx";
import { FindingsPanel, findingKey } from "./FindingsPanel.tsx";
import { CliOutputPanel } from "./CliOutputPanel.tsx";

const catCount = (r?: AnalysisResult) =>
  r ? new Set(r.findings.map((f) => f.category)).size : 0;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function CodeAnalysisLab() {
  const [results, setResults] = useState<Partial<Record<Tool, AnalysisResult>>>(
    {},
  );
  const [active, setActive] = useState<Tool>("fallow");
  const [selectedFile, setSelectedFile] = useState(sampleFiles[0].path);
  const [activeLine, setActiveLine] = useState<number | undefined>(undefined);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState<Tool | null>(null);

  const activeResult = results[active];
  const findings = activeResult?.findings ?? [];
  const fileObj =
    sampleFiles.find((f) => f.path === selectedFile) ?? sampleFiles[0];
  const findingsForFile = findings.filter((f) => f.file === selectedFile);

  const countInFile = (path: string) =>
    findings.filter((f) => f.file === path).length;

  async function analyze(tool: Tool) {
    setActive(tool);
    setLoading(tool);
    const [r] = await Promise.all([runAnalysis(tool, { live }), delay(420)]);
    setResults((prev) => ({ ...prev, [tool]: r }));
    const first = r.findings.find((f) => f.line) ?? r.findings[0];
    if (first) {
      setSelectedFile(first.file);
      setActiveLine(first.line);
      setSelectedKey(findingKey(first));
    }
    setLoading(null);
  }

  function selectFinding(f: Finding) {
    setSelectedFile(f.file);
    setActiveLine(f.line ?? 1);
    setSelectedKey(findingKey(f));
  }

  function selectFile(path: string) {
    setSelectedFile(path);
    const first = findings.find((f) => f.file === path && f.line);
    setActiveLine(first?.line);
    setSelectedKey(first ? findingKey(first) : undefined);
  }

  return (
    <div className="space-y-5">
      {/* コントロール */}
      <div className="flex flex-wrap items-center gap-3">
        <ToolButton
          tool="fallow"
          loading={loading === "fallow"}
          active={active === "fallow"}
          onClick={() => analyze("fallow")}
        />
        <ToolButton
          tool="knip"
          loading={loading === "knip"}
          active={active === "knip"}
          onClick={() => analyze("knip")}
        />
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-knip-300">
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
            className="h-4 w-4 accent-fallow-500"
          />
          Vercel でライブ実行
          <span className="text-xs text-knip-600">(fallow のみ)</span>
        </label>
      </div>

      {/* サマリ（両ツールの検出量コントラスト） */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          tool="fallow"
          result={results.fallow}
          active={active === "fallow"}
          onClick={() => results.fallow && setActive("fallow")}
        />
        <SummaryCard
          tool="knip"
          result={results.knip}
          active={active === "knip"}
          onClick={() => results.knip && setActive("knip")}
        />
      </div>

      {/* メイン: ファイルツリー / コード / 検出リスト */}
      <div className="grid gap-3 lg:grid-cols-[180px_1fr_280px]">
        {/* ファイルツリー */}
        <div className="overflow-auto rounded-xl border border-ink-700 bg-ink-900/70 p-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-knip-500">
            dashboard-sample
          </p>
          <ul className="space-y-0.5">
            {sampleFiles.map((f) => {
              const count = countInFile(f.path);
              const selected = f.path === selectedFile;
              return (
                <li key={f.path}>
                  <button
                    onClick={() => selectFile(f.path)}
                    className={
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left font-mono text-xs transition " +
                      (selected
                        ? "bg-ink-700 text-white"
                        : "text-knip-300 hover:bg-ink-800")
                    }
                  >
                    <span className="truncate">
                      {f.path.replace(/^src\//, "")}
                    </span>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full bg-rose-500/20 px-1.5 text-[10px] font-bold text-rose-300">
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* コード */}
        <CodeViewer
          file={fileObj}
          findings={findingsForFile}
          activeLine={activeLine}
        />

        {/* 検出リスト or プレースホルダ */}
        {activeResult ? (
          <FindingsPanel
            tool={active}
            findings={findings}
            onSelect={selectFinding}
            selectedKey={selectedKey}
          />
        ) : (
          <div className="flex h-[460px] items-center justify-center rounded-xl border border-dashed border-ink-700 bg-ink-900/40 p-6 text-center text-sm text-knip-500">
            上の「{active === "fallow" ? "Fallow" : "knip"} で解析」を押すと、
            <br />
            検出結果がここに表示されます。
          </div>
        )}
      </div>

      {/* CLI 出力 */}
      {activeResult && (
        <CliOutputPanel tool={active} cli={activeResult.cli} />
      )}
    </div>
  );
}

function ToolButton({
  tool,
  active,
  loading,
  onClick,
}: {
  tool: Tool;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const isFallow = tool === "fallow";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        "rounded-xl px-5 py-2.5 font-semibold transition disabled:opacity-70 " +
        (isFallow
          ? "bg-fallow-500 text-ink-950 enabled:hover:bg-fallow-400"
          : "border border-knip-500/40 bg-knip-500/10 text-knip-200 enabled:hover:bg-knip-500/20") +
        (active ? " ring-2 ring-offset-2 ring-offset-ink-950 " : " ") +
        (active ? (isFallow ? "ring-fallow-400" : "ring-knip-400") : "")
      }
    >
      {loading ? "解析中…" : `▶ ${isFallow ? "Fallow" : "knip"} で解析`}
    </button>
  );
}

function SummaryCard({
  tool,
  result,
  active,
  onClick,
}: {
  tool: Tool;
  result?: AnalysisResult;
  active: boolean;
  onClick: () => void;
}) {
  const isFallow = tool === "fallow";
  const total = result?.findings.length ?? 0;
  const cats = catCount(result);

  return (
    <button
      onClick={onClick}
      className={
        "rounded-2xl border p-5 text-left transition " +
        (active
          ? isFallow
            ? "border-fallow-500/50 bg-fallow-500/[0.07]"
            : "border-knip-400/50 bg-knip-500/[0.07]"
          : "border-ink-700 bg-ink-900/70 hover:border-ink-600") +
        (result ? " cursor-pointer" : " cursor-default")
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            "font-bold " + (isFallow ? "text-fallow-300" : "text-knip-300")
          }
        >
          {isFallow ? "Fallow" : "knip"}
        </span>
        {result && (
          <span className="text-[11px] text-knip-500">
            {result.source === "live"
              ? `ライブ実行 · ${result.elapsedMs}ms`
              : "実出力（キャプチャ）"}
          </span>
        )}
      </div>
      {result ? (
        <div className="mt-3 flex items-baseline gap-4">
          <span className="text-3xl font-extrabold text-white tabular-nums">
            {total}
            <span className="ml-1 text-base font-normal text-knip-400">件</span>
          </span>
          <span className="text-xl font-bold text-knip-300 tabular-nums">
            {cats}
            <span className="ml-1 text-sm font-normal text-knip-500">
              カテゴリ
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-knip-500">未解析</p>
      )}
    </button>
  );
}
