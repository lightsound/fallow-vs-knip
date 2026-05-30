import { useEffect, useRef, useState } from "react";
import {
  fallowScript,
  knipScript,
  type LineKind,
  type TerminalScript,
} from "../data/terminal.ts";
import { useInView } from "../hooks/useInView.ts";

const LINE_DELAY_MS = 140;

const lineClass: Record<LineKind, string> = {
  prompt: "text-fallow-300",
  heading: "text-knip-300 font-semibold",
  error: "text-rose-400",
  warn: "text-amber-glow",
  ok: "text-fallow-300",
  info: "text-knip-400",
  dim: "text-knip-500",
};

export function TerminalCompare() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [runId, setRunId] = useState(0);
  const started = useRef(false);

  // 画面に入ったら一度だけ自動再生。
  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      setRunId((n) => n + 1);
    }
  }, [inView]);

  return (
    <div ref={ref}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-lg border border-ink-600 bg-ink-850 px-4 py-2 text-sm font-medium text-knip-300 transition hover:border-fallow-500/50 hover:text-white"
        >
          ↻ 出力を再生
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Terminal script={knipScript} runId={runId} />
        <Terminal script={fallowScript} runId={runId} accent />
      </div>
    </div>
  );
}

function Terminal({
  script,
  runId,
  accent = false,
}: {
  script: TerminalScript;
  runId: number;
  accent?: boolean;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (runId === 0) return;
    setVisible(0);
    const id = setInterval(() => {
      setVisible((v) => {
        if (v >= script.lines.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, LINE_DELAY_MS);
    return () => clearInterval(id);
  }, [runId, script.lines.length]);

  const done = visible >= script.lines.length;

  return (
    <div
      className={
        "flex flex-col overflow-hidden rounded-xl border bg-ink-950 " +
        (accent ? "border-fallow-500/40" : "border-ink-700")
      }
    >
      {/* タイトルバー */}
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-rose-500/70" />
        <span className="h-3 w-3 rounded-full bg-amber-glow/70" />
        <span className="h-3 w-3 rounded-full bg-fallow-500/70" />
        <span className="ml-2 font-mono text-xs text-knip-400">
          {script.command}
        </span>
      </div>

      {/* 出力 */}
      <div className="min-h-[330px] flex-1 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        {script.lines.slice(0, visible).map((line, i) => (
          <pre
            key={i}
            className={"whitespace-pre-wrap " + lineClass[line.kind]}
          >
            {line.text || " "}
          </pre>
        ))}
        {!done && (
          <span className="inline-block h-4 w-2 animate-pulse bg-fallow-400 align-middle" />
        )}
      </div>

      {/* 要点 */}
      <div
        className={
          "border-t px-4 py-3 text-sm " +
          (accent
            ? "border-fallow-500/30 bg-fallow-500/[0.08] text-fallow-50"
            : "border-ink-800 bg-ink-900 text-knip-300")
        }
      >
        {script.takeaway}
      </div>
    </div>
  );
}
