import { featureGroups } from "../data/features.ts";
import { SupportMark, ToolBadge } from "./ui.tsx";

export function FeatureMatrix() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/70">
      {/* ヘッダ行 */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-ink-700 bg-ink-850 px-5 py-4 sm:px-7">
        <span className="text-sm font-semibold uppercase tracking-wide text-knip-400">
          機能
        </span>
        <span className="w-20 text-center">
          <ToolBadge tool="fallow" />
        </span>
        <span className="w-20 text-center">
          <ToolBadge tool="knip" />
        </span>
      </div>

      {featureGroups.map((group) => (
        <div key={group.title}>
          <div className="bg-ink-850/40 px-5 py-2.5 sm:px-7">
            <h3 className="text-sm font-bold text-fallow-300">{group.title}</h3>
          </div>
          {group.rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-ink-800 px-5 py-3.5 transition hover:bg-ink-850/40 sm:px-7"
            >
              <div>
                <p className="font-medium text-white">{row.label}</p>
                <p className="text-sm text-knip-400">{row.detail}</p>
              </div>
              <div className="flex w-20 justify-center">
                <SupportMark level={row.fallow} />
              </div>
              <div className="flex w-20 justify-center">
                <SupportMark level={row.knip} />
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* 凡例 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink-700 bg-ink-850 px-5 py-4 text-sm text-knip-400 sm:px-7">
        <span className="flex items-center gap-2">
          <SupportMark level="full" /> 対応
        </span>
        <span className="flex items-center gap-2">
          <SupportMark level="partial" /> 限定的 / プラグイン依存
        </span>
        <span className="flex items-center gap-2">
          <SupportMark level="none" /> 非対応
        </span>
      </div>
    </div>
  );
}
