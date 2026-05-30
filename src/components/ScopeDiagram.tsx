import { scopeLayers } from "../data/features.ts";
import { ToolBadge } from "./ui.tsx";

export function ScopeDiagram() {
  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      {/* 左: カバレッジを示すスパイン（lg 以上で表示） */}
      <div className="hidden flex-col gap-4 lg:flex">
        <div className="flex h-full gap-3">
          <Spine label="knip" tone="knip" fillRatio={1 / scopeLayers.length} />
          <Spine label="Fallow" tone="fallow" fillRatio={1} />
        </div>
      </div>

      {/* 右: レイヤースタック */}
      <div className="space-y-3">
        {scopeLayers.map((layer, i) => {
          const knipCovers = layer.tools.includes("knip");
          return (
            <div
              key={layer.name}
              className={
                "rounded-xl border p-5 transition " +
                (knipCovers
                  ? "border-knip-500/40 bg-ink-850"
                  : "border-fallow-500/30 bg-fallow-500/[0.06]")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-knip-500">
                      L{i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      {layer.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-knip-400">{layer.blurb}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ToolBadge tool="fallow" />
                  {knipCovers && <ToolBadge tool="knip" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Spine({
  label,
  tone,
  fillRatio,
}: {
  label: string;
  tone: "fallow" | "knip";
  fillRatio: number;
}) {
  const isFallow = tone === "fallow";
  return (
    <div className="flex w-16 flex-col">
      <div className="relative flex-1 overflow-hidden rounded-full bg-ink-800">
        <div
          className={
            "absolute inset-x-0 top-0 rounded-full " +
            (isFallow ? "bg-fallow-500/70" : "bg-knip-500/60")
          }
          style={{ height: `${fillRatio * 100}%` }}
        />
      </div>
      <span
        className={
          "mt-2 text-center text-xs font-semibold " +
          (isFallow ? "text-fallow-300" : "text-knip-300")
        }
      >
        {label}
      </span>
    </div>
  );
}
