import type { FindingCategory } from "../lib/analysis.ts";

export type CatStyle = {
  icon: string;
  dot: string;
  chipText: string;
  chipBg: string;
  lineBorder: string;
  lineBg: string;
};

// カテゴリごとの配色。クラスは文字列リテラルで持ち、Tailwind のスキャナに拾わせる。
export const CAT_STYLE: Record<FindingCategory, CatStyle> = {
  "unused-file": {
    icon: "📄",
    dot: "bg-rose-400",
    chipText: "text-rose-300",
    chipBg: "bg-rose-500/12",
    lineBorder: "border-rose-500",
    lineBg: "bg-rose-500/10",
  },
  "unused-export": {
    icon: "📤",
    dot: "bg-amber-400",
    chipText: "text-amber-300",
    chipBg: "bg-amber-500/12",
    lineBorder: "border-amber-500",
    lineBg: "bg-amber-500/10",
  },
  "unused-dependency": {
    icon: "📦",
    dot: "bg-sky-400",
    chipText: "text-sky-300",
    chipBg: "bg-sky-500/12",
    lineBorder: "border-sky-500",
    lineBg: "bg-sky-500/10",
  },
  duplication: {
    icon: "⧉",
    dot: "bg-violet-400",
    chipText: "text-violet-300",
    chipBg: "bg-violet-500/12",
    lineBorder: "border-violet-500",
    lineBg: "bg-violet-500/10",
  },
  "circular-dependency": {
    icon: "🔄",
    dot: "bg-orange-400",
    chipText: "text-orange-300",
    chipBg: "bg-orange-500/12",
    lineBorder: "border-orange-500",
    lineBg: "bg-orange-500/10",
  },
  complexity: {
    icon: "🔥",
    dot: "bg-pink-400",
    chipText: "text-pink-300",
    chipBg: "bg-pink-500/12",
    lineBorder: "border-pink-500",
    lineBg: "bg-pink-500/10",
  },
};
