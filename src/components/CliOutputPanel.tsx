import type { Tool } from "../lib/analysis.ts";

type Props = {
  tool: Tool;
  cli: string;
};

function lineClass(line: string): string {
  const t = line.trimStart();
  if (t.startsWith("✗") || t.startsWith("x ")) return "text-rose-400";
  if (t.startsWith("●")) return "text-fallow-300 font-semibold";
  if (t.startsWith("■")) return "text-sky-300";
  if (t.startsWith("!")) return "text-amber-glow";
  if (t.startsWith("──") || t.startsWith("--") || t.startsWith("Unused"))
    return "text-knip-400 font-semibold";
  if (t.includes("http")) return "text-knip-600";
  return "text-knip-300";
}

export function CliOutputPanel({ tool, cli }: Props) {
  const command = tool === "fallow" ? "npx fallow" : "npx knip";
  const lines = cli.split("\n");

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-950">
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-rose-500/70" />
        <span className="h-3 w-3 rounded-full bg-amber-glow/70" />
        <span className="h-3 w-3 rounded-full bg-fallow-500/70" />
        <span className="ml-2 font-mono text-xs text-knip-400">
          $ {command}
        </span>
        <span className="ml-auto text-[11px] text-knip-600">
          実際の CLI 出力
        </span>
      </div>
      <div className="max-h-[300px] overflow-auto p-4 font-mono text-[12px] leading-relaxed">
        {lines.map((line, i) => (
          <pre key={i} className={"whitespace-pre-wrap " + lineClass(line)}>
            {line || " "}
          </pre>
        ))}
      </div>
    </div>
  );
}
