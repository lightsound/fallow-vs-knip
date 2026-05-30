type Card = {
  icon: string;
  title: string;
  body: string;
};

const cards: Card[] = [
  {
    icon: "⚡",
    title: "Rust ネイティブ / サブ秒",
    body: "TypeScript コンパイラも Node ランタイムも介さず解析。CI で待たされない速度が、そのまま開発体験になります。",
  },
  {
    icon: "🧭",
    title: "1スキャンで5レイヤー",
    body: "デッドコード・重複・複雑度・アーキテクチャ・PR リスクを一度に。ツールを何本も繋ぐ必要がありません。",
  },
  {
    icon: "🤖",
    title: "エージェント・ファースト",
    body: "MCP / LSP / 型付き JSON 出力。AI エージェントが grep で推測する代わりに、構造化された“事実”を受け取れます。",
  },
  {
    icon: "🎯",
    title: "決定的で再現可能",
    body: "アナライザに AI は入っていません。findings は再現可能で追跡可能。レビューの根拠として信頼できます。",
  },
  {
    icon: "🏛️",
    title: "アーキテクチャを守る",
    body: "循環依存・レイヤ境界違反を検出。layered / hexagonal / feature-sliced などのプリセットをゼロ設定で。",
  },
  {
    icon: "🔁",
    title: "knip からの移行も一発",
    body: "`fallow migrate` で knip / jscpd の設定を引き継ぎ。ignoreExportsUsedInFile など knip 互換オプションも用意。",
  },
];

export function WhyFallow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="group rounded-2xl border border-ink-700 bg-ink-900/70 p-6 transition hover:border-fallow-500/40 hover:bg-ink-850"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-fallow-500/10 text-2xl ring-1 ring-fallow-500/20">
            {card.icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{card.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-knip-300">
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}
