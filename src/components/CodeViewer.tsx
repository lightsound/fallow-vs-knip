import { useEffect, useRef } from "react";
import type { Finding } from "../lib/analysis.ts";
import type { SampleFile } from "../data/sample.ts";
import { CAT_STYLE } from "./categoryStyle.ts";

type Props = {
  file: SampleFile;
  /** この表示ファイルに属する findings（アクティブツール分）。 */
  findings: Finding[];
  /** スクロール＆強調する行。 */
  activeLine?: number;
};

export function CodeViewer({ file, findings, activeLine }: Props) {
  const activeRef = useRef<HTMLDivElement>(null);

  // 行 → その行を含む finding（範囲は start..end）。先勝ちで1件。
  const lineToFinding = new Map<number, Finding>();
  // finding の開始行 → 注釈チップ表示用。
  const annotations = new Map<number, Finding[]>();
  for (const f of findings) {
    const start = f.line ?? 0;
    const end = f.endLine ?? f.line ?? 0;
    for (let ln = start; ln <= end; ln++) {
      if (!lineToFinding.has(ln)) lineToFinding.set(ln, f);
    }
    if (f.line) {
      const list = annotations.get(f.line) ?? [];
      list.push(f);
      annotations.set(f.line, list);
    }
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLine, file.path]);

  return (
    <div className="h-[460px] overflow-auto rounded-xl border border-ink-700 bg-ink-950 font-mono text-[12.5px] leading-[1.6]">
      <table className="w-full border-collapse">
        <tbody>
          {file.lines.map((tokens, i) => {
            const ln = i + 1;
            const finding = lineToFinding.get(ln);
            const style = finding ? CAT_STYLE[finding.category] : null;
            const isActive = activeLine === ln;
            const anns = annotations.get(ln);
            return (
              <tr key={ln}>
                <td className="w-full p-0 align-top">
                  <div
                    ref={isActive ? activeRef : undefined}
                    className={
                      "flex border-l-2 " +
                      (style
                        ? `${style.lineBorder} ${style.lineBg}`
                        : "border-transparent") +
                      (isActive ? " ring-1 ring-inset ring-fallow-400/60" : "")
                    }
                  >
                    <span className="w-12 shrink-0 select-none px-3 text-right text-knip-600">
                      {ln}
                    </span>
                    <code className="whitespace-pre px-3">
                      {tokens.length === 0
                        ? " "
                        : tokens.map((t, j) => (
                            <span
                              key={j}
                              style={{
                                color: t.color,
                                fontStyle: t.italic ? "italic" : undefined,
                              }}
                            >
                              {t.text}
                            </span>
                          ))}
                    </code>
                  </div>
                  {anns?.map((f, k) => {
                    const s = CAT_STYLE[f.category];
                    return (
                      <div
                        key={k}
                        className="flex border-l-2 border-transparent"
                      >
                        <span className="w-12 shrink-0 select-none" />
                        <span
                          className={
                            "my-0.5 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] " +
                            `${s.chipBg} ${s.chipText}`
                          }
                        >
                          <span>{s.icon}</span>
                          <span className="font-sans">{f.message}</span>
                          {f.detail && (
                            <span className="font-sans opacity-70">
                              · {f.detail}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
