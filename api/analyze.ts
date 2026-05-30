import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// 重い ESM/native パッケージ(knip / @fallow-cli/fallow-node)を「この関数モジュールへ静的 import」すると、
// Vercel が CJS にバンドルした際に ESM 依存(oxc-parser 等)の require() で ERR_REQUIRE_ESM になる。
// そこで CLI を子プロセスで spawn する。別 node プロセスでは ESM 解決が正常に働く。
// バイナリ/依存は vercel.json の includeFiles で node_modules をバンドルして供給する。

const SAMPLE_SRC = join(process.cwd(), "analysis-sample");
const FALLOW_BIN = join(process.cwd(), "node_modules/fallow/bin/fallow");
const KNIP_BIN = join(process.cwd(), "node_modules/knip/bin/knip.js");

// /var/task は読み取り専用。ツールがキャッシュを書けるよう writable な /tmp に複製する。
function prepareSample(tag: string): string {
  const dir = mkdtempSync(join(tmpdir(), `sample-${tag}-`));
  cpSync(SAMPLE_SRC, dir, {
    recursive: true,
    // ビルド成果物(.js 等)の混入を防ぎ、解析対象を元のソースに固定する。
    // ディレクトリ（拡張子なし）は許可して再帰し、ファイルは .ts/.tsx/.json のみ通す。
    filter: (src) => {
      if (src.includes("/node_modules") || src.includes("/.fallow")) return false;
      const hasExt = /\.[a-z0-9]+$/i.test(src);
      if (!hasExt) return true;
      return /\.(ts|tsx|json)$/i.test(src) && !src.endsWith(".d.ts");
    },
  });
  // knip は import 解決に依存の実体が要る。ルートの node_modules(react/typescript 等を含む)を
  // 読み取り専用 symlink で供給する。fallow は構文解析のみで不要だが、あっても無害。
  try {
    symlinkSync(join(process.cwd(), "node_modules"), join(dir, "node_modules"), "dir");
  } catch {
    // 解決補助は任意。失敗してもツール実行は続行する。
  }
  return dir;
}

function runStdout(args: string[]): string {
  try {
    return execFileSync(process.execPath, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    return (e as { stdout?: Buffer | string }).stdout?.toString() ?? "";
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function projectFallow(fj: any) {
  return {
    check: {
      unused_files: (fj.check?.unused_files ?? []).map((f: any) => ({ path: f.path })),
      unused_exports: (fj.check?.unused_exports ?? []).map((e: any) => ({
        path: e.path,
        export_name: e.export_name,
        line: e.line,
      })),
      unused_dependencies: (fj.check?.unused_dependencies ?? []).map((d: any) => ({
        package_name: d.package_name,
        line: d.line,
      })),
      circular_dependencies: (fj.check?.circular_dependencies ?? []).map((c: any) => ({
        files: c.files,
        line: c.line,
      })),
    },
    dupes: {
      clone_groups: (fj.dupes?.clone_groups ?? []).map((g: any) => ({
        instances: (g.instances ?? []).map((i: any) => ({
          file: i.file,
          start_line: i.start_line,
          end_line: i.end_line,
        })),
      })),
    },
    health: {
      findings: (fj.health?.findings ?? []).map((h: any) => ({
        path: h.path,
        name: h.name,
        line: h.line,
        cyclomatic: h.cyclomatic,
        cognitive: h.cognitive,
        crap: h.crap,
        severity: h.severity,
      })),
    },
  };
}

function projectKnip(kj: any) {
  const pick = (arr: any[] | undefined) =>
    (arr ?? []).map((x: any) => ({ name: x.name, line: x.line }));
  return {
    issues: (kj.issues ?? []).map((it: any) => ({
      file: it.file,
      files: it.files ?? [],
      exports: pick(it.exports),
      types: pick(it.types),
      dependencies: pick(it.dependencies),
      devDependencies: pick(it.devDependencies),
      duplicates: pick(it.duplicates),
    })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Vercel の Node ランタイムが (req, res) で呼び出す。型は @vercel/node に依存せずインライン定義。
type AnalyzeRequest = { query?: Record<string, string | string[] | undefined> };
type AnalyzeResponse = {
  status: (code: number) => AnalyzeResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: AnalyzeRequest, res: AnalyzeResponse) {
  const tool = String(req.query.tool ?? "");
  try {
    if (tool === "fallow") {
      const root = prepareSample("fallow");
      const started = Date.now();
      const out = runStdout([FALLOW_BIN, "--root", root, "--format", "json"]);
      const raw = projectFallow(JSON.parse(out));
      res.status(200).json({ tool, raw, cli: "", elapsedMs: Date.now() - started });
      return;
    }
    if (tool === "knip") {
      const root = prepareSample("knip");
      const started = Date.now();
      const out = runStdout([
        KNIP_BIN,
        "--directory",
        root,
        "--reporter",
        "json",
        "--no-exit-code",
        "--no-progress",
      ]);
      const raw = projectKnip(JSON.parse(out));
      res.status(200).json({ tool, raw, cli: "", elapsedMs: Date.now() - started });
      return;
    }
    res.status(400).json({ error: "tool must be 'fallow' or 'knip'" });
  } catch (err) {
    res.status(500).json({ error: String((err as Error)?.message ?? err) });
  }
}
