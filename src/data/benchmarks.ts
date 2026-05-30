// 出典: fallow-rs/fallow README "Performance" セクション
// 計測条件: real OSS プロジェクトでの median(5 runs / 2 warmups), Apple M5。
// knip が有効な JSON 結果を返さなかったケースは null（= 失敗）で表す。

export type DeadCodeBenchmark = {
  project: string;
  repo: string;
  files: number;
  fallowMs: number;
  knipV5Ms: number | null;
  knipV6Ms: number | null;
};

export const deadCodeBenchmarks: DeadCodeBenchmark[] = [
  {
    project: "zod",
    repo: "colinhacks/zod",
    files: 174,
    fallowMs: 25,
    knipV5Ms: 650,
    knipV6Ms: 330,
  },
  {
    project: "fastify",
    repo: "fastify/fastify",
    files: 286,
    fallowMs: 27,
    knipV5Ms: 933,
    knipV6Ms: 222,
  },
  {
    project: "preact",
    repo: "preactjs/preact",
    files: 244,
    fallowMs: 200,
    knipV5Ms: 911,
    knipV6Ms: 2150,
  },
  {
    project: "vue/core",
    repo: "vuejs/core",
    files: 522,
    fallowMs: 68,
    knipV5Ms: null,
    knipV6Ms: null,
  },
  {
    project: "TanStack/query",
    repo: "TanStack/query",
    files: 901,
    fallowMs: 330,
    knipV5Ms: 2660,
    knipV6Ms: 1080,
  },
  {
    project: "vite",
    repo: "vitejs/vite",
    files: 1420,
    fallowMs: 378,
    knipV5Ms: null,
    knipV6Ms: null,
  },
  {
    project: "svelte",
    repo: "sveltejs/svelte",
    files: 3337,
    fallowMs: 363,
    knipV5Ms: 1950,
    knipV6Ms: 714,
  },
  {
    project: "next.js",
    repo: "vercel/next.js",
    files: 20416,
    fallowMs: 1720,
    knipV5Ms: null,
    knipV6Ms: null,
  },
];

export type DuplicationBenchmark = {
  project: string;
  files: number;
  fallowMs: number;
  jscpdMs: number;
  speedup: string;
};

// 重複検出: fallow vs jscpd
export const duplicationBenchmarks: DuplicationBenchmark[] = [
  { project: "fastify", files: 286, fallowMs: 76, jscpdMs: 1960, speedup: "26x" },
  { project: "vue/core", files: 522, fallowMs: 124, jscpdMs: 3110, speedup: "25x" },
  { project: "next.js", files: 20416, fallowMs: 2890, jscpdMs: 24370, speedup: "8x" },
];

/** ms を読みやすい単位の文字列にする (例: 25 -> "25ms", 1720 -> "1.72s")。 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** fallow が knip(より速い方の有効値)に対して何倍速いか。失敗時は null。 */
export function fastestSpeedup(b: DeadCodeBenchmark): number | null {
  const knipTimes = [b.knipV5Ms, b.knipV6Ms].filter(
    (t): t is number => t !== null,
  );
  if (knipTimes.length === 0) return null;
  const best = Math.min(...knipTimes);
  return best / b.fallowMs;
}
