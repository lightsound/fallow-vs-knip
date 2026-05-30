import { Hero } from "./components/Hero.tsx";
import { Section } from "./components/Section.tsx";
import { BenchmarkRace } from "./components/BenchmarkRace.tsx";
import { FeatureMatrix } from "./components/FeatureMatrix.tsx";
import { ScopeDiagram } from "./components/ScopeDiagram.tsx";
import { TerminalCompare } from "./components/TerminalCompare.tsx";
import { CodeAnalysisLab } from "./components/CodeAnalysisLab.tsx";
import { WhyFallow } from "./components/WhyFallow.tsx";
import { duplicationBenchmarks, formatDuration } from "./data/benchmarks.ts";

const navItems = [
  { href: "#benchmark", label: "速度" },
  { href: "#features", label: "機能" },
  { href: "#scope", label: "守備範囲" },
  { href: "#analyze", label: "解析デモ" },
  { href: "#cli", label: "CLI 出力" },
  { href: "#why", label: "なぜ Fallow" },
];

export function App() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <a href="#top" className="font-bold tracking-tight text-white">
            <span className="text-fallow-400">Fallow</span>
            <span className="text-knip-500"> vs </span>
            <span className="text-knip-300">knip</span>
          </a>
          <div className="hidden gap-6 text-sm text-knip-300 sm:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-fallow-300"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main id="top">
        <Hero />

        <Section
          id="benchmark"
          eyebrow="Performance"
          title="同じ「未使用検出」が、桁違いに速い"
          description="プロジェクトを選んで実行ボタンを押すと、実測値に比例してバーが伸びます。大規模リポジトリでは knip がそもそも結果を返せないケースも。"
        >
          <BenchmarkRace />
        </Section>

        <Section
          id="features"
          eyebrow="Feature Matrix"
          title="knip ができることは、Fallow もできる"
          description="未使用検出は両者の共通項。そこから先、品質・重複・アーキテクチャ・連携で差がつきます。"
        >
          <FeatureMatrix />
        </Section>

        <Section
          id="scope"
          eyebrow="Scope"
          title="knip は一部分。Fallow はコードベース全体"
          description="knip が担うのはデッドコード／依存ハイジーンの層。Fallow はその上に重複・複雑度・アーキテクチャ・PR リスクを積み上げます。"
        >
          <ScopeDiagram />
        </Section>

        <Section
          id="analyze"
          eyebrow="Live Analysis"
          title="同じコードを、その場で解析してみる"
          description="左のサンプルコードに対して Fallow / knip の解析ボタンを押すと、何を・どこで検出するかがコード上に表示されます。同じコードでも、光る箇所の数がまるで違います。"
        >
          <CodeAnalysisLab />
        </Section>

        <Section
          id="cli"
          eyebrow="CLI Output"
          title="出力で見る、返ってくる情報量の差"
          description="左が knip、右が fallow audit。同じ1コマンドで、Fallow は判定（pass/warn/fail）とヘルススコアまで返します。"
        >
          <TerminalCompare />
        </Section>

        <Section
          eyebrow="Bonus"
          title="重複検出は jscpd も置き換える"
          description="Fallow の重複検出は専用ツール jscpd に対しても 8〜26x 高速。別ツールを束ねる必要がありません。"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {duplicationBenchmarks.map((d) => (
              <div
                key={d.project}
                className="rounded-2xl border border-ink-700 bg-ink-900/70 p-6"
              >
                <p className="font-mono text-sm text-knip-400">{d.project}</p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-fallow-300">
                    {formatDuration(d.fallowMs)}
                  </span>
                  <span className="text-sm text-knip-500">
                    vs jscpd {formatDuration(d.jscpdMs)}
                  </span>
                </p>
                <p className="mt-2 text-sm font-semibold text-fallow-400">
                  {d.speedup} faster
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="why"
          eyebrow="Why Fallow"
          title="AI 時代のコードベースに、決定的な“事実”を"
          description="コードは速く増える。レビューもクリーンアップもアーキテクチャも、推測ではなく根拠で回すために。"
        >
          <WhyFallow />
        </Section>
      </main>

      <footer className="border-t border-ink-700 bg-ink-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 text-sm text-knip-400">
          <p>
            データ出典: fallow-rs/fallow および webpro-nl/knip の公式 README /
            ドキュメント。ベンチマークは Apple M5・median(5 runs / 2 warmups)。
          </p>
          <p className="mt-2">
            ライブコーディング講座用に作成した比較ショーケース（React 19 +
            TypeScript + Vite + Tailwind v4）。
          </p>
        </div>
      </footer>
    </div>
  );
}
