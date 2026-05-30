const stats = [
  { value: "最大 34x", label: "デッドコード検出の速度（vs knip v5・fastify）" },
  { value: "116", label: "内蔵フレームワークプラグイン" },
  { value: "5 → 1", label: "fallow が一度に返す分析レイヤー数" },
];

export function Hero() {
  return (
    <header className="grid-bg relative overflow-hidden border-b border-ink-700">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-850/60 px-4 py-1.5 text-sm text-knip-300 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fallow-400" />
          ライブコーディング講座用ショーケース
        </div>

        <h1 className="mt-8 max-w-4xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          <span className="text-fallow-400">Fallow</span>
          <span className="text-knip-500"> vs </span>
          <span className="text-knip-300">knip</span>
        </h1>

        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-knip-300">
          knip は <strong className="text-white">デッドコードを列挙する</strong>
          リンター。Fallow は{" "}
          <strong className="text-fallow-300">
            コードベース全体を採点する Rust 製インテリジェンス
          </strong>
          。同じ「未使用検出」を桁違いに速くこなしながら、重複・複雑度・アーキテクチャ・PR
          リスクまで一度に返します。
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#benchmark"
            className="rounded-xl bg-fallow-500 px-6 py-3 font-semibold text-ink-950 transition hover:bg-fallow-400"
          >
            速度の差を体感する
          </a>
          <a
            href="#features"
            className="rounded-xl border border-ink-600 bg-ink-850/60 px-6 py-3 font-semibold text-white backdrop-blur transition hover:border-fallow-500/50"
          >
            機能を比較する
          </a>
        </div>

        <dl className="mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-700 bg-ink-700 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-900 px-6 py-6">
              <dt className="text-3xl font-bold text-fallow-300">{s.value}</dt>
              <dd className="mt-2 text-sm leading-snug text-knip-400">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
