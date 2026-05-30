import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type Finding,
  type FindingCategory,
  type Tool,
} from "../lib/analysis.ts";
import { CAT_STYLE } from "./categoryStyle.ts";

type Props = {
  tool: Tool;
  findings: Finding[];
  onSelect: (f: Finding) => void;
  selectedKey?: string;
};

export const findingKey = (f: Finding) =>
  `${f.category}:${f.file}:${f.line ?? 0}:${f.symbol ?? ""}`;

export function FindingsPanel({ tool, findings, onSelect, selectedKey }: Props) {
  const byCat = (cat: FindingCategory) => findings.filter((f) => f.category === cat);

  return (
    <div className="flex h-[460px] flex-col overflow-auto rounded-xl border border-ink-700 bg-ink-900/70">
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const items = byCat(cat);
        const style = CAT_STYLE[cat];
        const unsupported = items.length === 0 && meta.advanced && tool === "knip";

        return (
          <div key={cat} className="border-b border-ink-800 last:border-0">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className={"h-2.5 w-2.5 rounded-full " + style.dot} />
                <span className="text-sm font-semibold text-white">
                  {style.icon} {meta.label}
                </span>
                {meta.advanced && (
                  <span className="rounded bg-fallow-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-fallow-300">
                    Fallow のみ
                  </span>
                )}
              </div>
              {unsupported ? (
                <span className="text-xs font-medium text-knip-600">検出不可</span>
              ) : (
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums " +
                    (items.length > 0
                      ? `${style.chipBg} ${style.chipText}`
                      : "bg-ink-800 text-knip-600")
                  }
                >
                  {items.length}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <ul className="px-2 pb-2">
                {items.map((f) => {
                  const key = findingKey(f);
                  const selected = key === selectedKey;
                  return (
                    <li key={key}>
                      <button
                        onClick={() => onSelect(f)}
                        className={
                          "w-full rounded-lg px-2 py-1.5 text-left transition " +
                          (selected ? "bg-ink-700" : "hover:bg-ink-800")
                        }
                      >
                        <span className="block font-mono text-xs text-knip-200">
                          {f.symbol ?? f.file.split("/").pop()}
                          {f.line ? (
                            <span className="text-knip-500">:{f.line}</span>
                          ) : null}
                        </span>
                        <span className="block truncate text-[11px] text-knip-500">
                          {f.file}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
