import type { Support } from "../data/features.ts";

/** 機能対応状況のアイコン。 */
export function SupportMark({ level }: { level: Support }) {
  if (level === "full") {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-fallow-500/15 text-fallow-400"
        title="対応"
        aria-label="対応"
      >
        <CheckIcon />
      </span>
    );
  }
  if (level === "partial") {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-glow/15 text-amber-glow"
        title="限定的 / プラグイン依存"
        aria-label="限定的"
      >
        <DotIcon />
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-knip-600/30 text-knip-500"
      title="非対応"
      aria-label="非対応"
    >
      <DashIcon />
    </span>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3 w-3" aria-hidden>
      <circle cx="10" cy="10" r="4.5" fill="currentColor" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 10h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ツール名バッジ。 */
export function ToolBadge({ tool }: { tool: "fallow" | "knip" }) {
  const isFallow = tool === "fallow";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold " +
        (isFallow
          ? "bg-fallow-500/15 text-fallow-300 ring-1 ring-fallow-500/30"
          : "bg-knip-500/15 text-knip-300 ring-1 ring-knip-500/30")
      }
    >
      <span
        className={
          "h-2 w-2 rounded-full " + (isFallow ? "bg-fallow-400" : "bg-knip-400")
        }
      />
      {isFallow ? "Fallow" : "knip"}
    </span>
  );
}
