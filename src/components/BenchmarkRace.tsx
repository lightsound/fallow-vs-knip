import { useEffect, useMemo, useRef, useState } from "react";
import {
  deadCodeBenchmarks,
  fastestSpeedup,
  formatDuration,
  type DeadCodeBenchmark,
} from "../data/benchmarks.ts";

// 一番遅いレーンがこの壁時計時間で完走するよう、各レーンの所要をスケールする。
const MAX_ANIM_MS = 2800;
const CRASH_PROGRESS = 0.82;

type LaneSpec = {
  key: string;
  label: string;
  tool: "fallow" | "knip";
  finalMs: number | null;
};

function lanesFor(b: DeadCodeBenchmark): LaneSpec[] {
  return [
    { key: "fallow", label: "Fallow", tool: "fallow", finalMs: b.fallowMs },
    { key: "knip5", label: "knip v5", tool: "knip", finalMs: b.knipV5Ms },
    { key: "knip6", label: "knip v6", tool: "knip", finalMs: b.knipV6Ms },
  ];
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BenchmarkRace() {
  const [index, setIndex] = useState(1); // 既定: fastify（34x が映える）
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const rafRef = useRef<number | null>(null);

  const bench = deadCodeBenchmarks[index];
  const lanes = useMemo(() => lanesFor(bench), [bench]);

  // このレースのスケール基準（有限値の最大、無ければ fallow）。
  const maxRealMs = useMemo(() => {
    const finite = lanes
      .map((l) => l.finalMs)
      .filter((m): m is number => m !== null);
    return finite.length ? Math.max(...finite, bench.fallowMs) : bench.fallowMs;
  }, [lanes, bench.fallowMs]);

  function run() {
    if (prefersReducedMotion()) {
      setElapsed(MAX_ANIM_MS);
      setPhase("done");
      return;
    }
    setPhase("running");
    setElapsed(0);
    const start = performance.now();
    const tick = (now: number) => {
      const e = now - start;
      if (e >= MAX_ANIM_MS) {
        setElapsed(MAX_ANIM_MS);
        setPhase("done");
        rafRef.current = null;
        return;
      }
      setElapsed(e);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function selectProject(i: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIndex(i);
    setElapsed(0);
    setPhase("idle");
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5 sm:p-8">
      {/* プロジェクト選択 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {deadCodeBenchmarks.map((b, i) => (
          <button
            key={b.project}
            onClick={() => selectProject(i)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (i === index
                ? "bg-fallow-500 text-ink-950"
                : "bg-ink-800 text-knip-300 hover:bg-ink-700")
            }
          >
            {b.project}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-knip-400">解析対象</p>
          <p className="text-2xl font-bold text-white">
            {bench.project}{" "}
            <span className="text-base font-normal text-knip-400">
              {bench.files.toLocaleString()} files
            </span>
          </p>
        </div>
        <button
          onClick={run}
          disabled={phase === "running"}
          className="rounded-xl bg-fallow-500 px-6 py-3 font-semibold text-ink-950 transition enabled:hover:bg-fallow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {phase === "idle"
            ? "▶ ベンチマークを走らせる"
            : phase === "running"
              ? "計測中…"
              : "↻ もう一度"}
        </button>
      </div>

      {/* レーン */}
      <div className="space-y-4">
        {lanes.map((lane) => (
          <Lane
            key={lane.key}
            lane={lane}
            elapsed={elapsed}
            maxRealMs={maxRealMs}
            phase={phase}
          />
        ))}
      </div>

      {phase === "done" && <Verdict bench={bench} />}

      <p className="mt-6 text-xs leading-relaxed text-knip-500">
        出典: fallow-rs/fallow README。median(5 runs / 2 warmups), Apple M5。
        バーの長さは実測値に比例。「クラッシュ」は knip が有効な JSON
        結果を返さなかったケース。
      </p>
    </div>
  );
}

function Verdict({ bench }: { bench: DeadCodeBenchmark }) {
  const speedup = fastestSpeedup(bench);
  return (
    <div className="mt-6 rounded-xl border border-fallow-500/30 bg-fallow-500/10 p-5">
      {speedup !== null ? (
        <p className="text-lg text-white">
          Fallow は{" "}
          <span className="font-bold text-fallow-300">
            {formatDuration(bench.fallowMs)}
          </span>{" "}
          で完走。knip の最速値に対して{" "}
          <span className="text-2xl font-extrabold text-fallow-300">
            {speedup >= 10 ? Math.round(speedup) : speedup.toFixed(1)}x
          </span>{" "}
          高速。
        </p>
      ) : (
        <p className="text-lg text-white">
          Fallow は{" "}
          <span className="font-bold text-fallow-300">
            {formatDuration(bench.fallowMs)}
          </span>{" "}
          で完走。
          <span className="font-bold text-rose-400">
            {" "}
            knip は有効な結果を返せず
          </span>
          、この規模では比較すら成立しません。
        </p>
      )}
    </div>
  );
}

function Lane({
  lane,
  elapsed,
  maxRealMs,
  phase,
}: {
  lane: LaneSpec;
  elapsed: number;
  maxRealMs: number;
  phase: "idle" | "running" | "done";
}) {
  const isFallow = lane.tool === "fallow";
  const crashed = lane.finalMs === null;

  // 全レーンを同じ px/ms で伸ばす（= バー長は実時間に比例）。
  // 最遅レーン（targetFraction = 1）が elapsed = MAX_ANIM_MS でちょうど満了。
  const rate = phase === "idle" ? 0 : Math.min(elapsed / MAX_ANIM_MS, 1);
  const targetFraction = crashed ? CRASH_PROGRESS : lane.finalMs! / maxRealMs;
  const grown = Math.min(rate, targetFraction);

  const finished = !crashed && grown >= targetFraction && phase !== "idle";
  const crashShown = crashed && grown >= CRASH_PROGRESS && phase !== "idle";

  // 伸長中に表示する経過 ms（最終値に向かって増える）。
  const displayedMs =
    lane.finalMs !== null
      ? Math.round((grown / targetFraction) * lane.finalMs)
      : 0;

  const barColor = isFallow
    ? "bg-gradient-to-r from-fallow-600 to-fallow-400"
    : crashed
      ? "bg-gradient-to-r from-knip-600 to-rose-500/80"
      : "bg-gradient-to-r from-knip-600 to-knip-400";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span
          className={
            "font-semibold " + (isFallow ? "text-fallow-300" : "text-knip-300")
          }
        >
          {lane.label}
        </span>
        <span className="font-mono tabular-nums">
          {crashShown ? (
            <span className="text-rose-400">✕ クラッシュ（結果なし）</span>
          ) : finished ? (
            <span className={isFallow ? "text-fallow-300" : "text-knip-300"}>
              {formatDuration(lane.finalMs as number)}
            </span>
          ) : phase === "idle" ? (
            <span className="text-knip-600">待機中</span>
          ) : (
            <span className="text-knip-400">
              {crashed ? "解析中…" : formatDuration(displayedMs)}
            </span>
          )}
        </span>
      </div>
      <div className="h-9 overflow-hidden rounded-lg bg-ink-800 ring-1 ring-ink-700">
        <div
          className={
            "flex h-full items-center justify-end rounded-lg pr-3 " +
            barColor +
            (phase === "running" ? "" : " transition-[width] duration-500")
          }
          style={{ width: `${Math.max(grown * 100, 2)}%` }}
        >
          {finished && isFallow && (
            <span className="text-xs font-bold text-ink-950">🏁</span>
          )}
          {crashShown && (
            <span className="text-xs font-bold text-white">✕</span>
          )}
        </div>
      </div>
    </div>
  );
}
