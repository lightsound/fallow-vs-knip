// 機能差分は両ツールの公式 README / ドキュメントの記載に基づく。
// support: "full" = 一次機能として提供, "partial" = 限定的/プラグイン依存, "none" = 非対応。

export type Support = "full" | "partial" | "none";

export type FeatureRow = {
  label: string;
  detail: string;
  fallow: Support;
  knip: Support;
};

export type FeatureGroup = {
  title: string;
  rows: FeatureRow[];
};

export const featureGroups: FeatureGroup[] = [
  {
    title: "デッドコード検出",
    rows: [
      {
        label: "未使用ファイル",
        detail: "どこからも import されないファイル",
        fallow: "full",
        knip: "full",
      },
      {
        label: "未使用 export",
        detail: "公開しているが参照されない export",
        fallow: "full",
        knip: "full",
      },
      {
        label: "未使用 dependency",
        detail: "package.json にあるが使われない依存",
        fallow: "full",
        knip: "full",
      },
      {
        label: "未使用の型 / enum / class メンバー",
        detail: "型エイリアス・enum 値・クラスメンバー単位の検出",
        fallow: "full",
        knip: "partial",
      },
      {
        label: "stale な抑制コメント",
        detail: "もう不要になった ignore コメントを検出",
        fallow: "full",
        knip: "none",
      },
    ],
  },
  {
    title: "品質・リスク分析",
    rows: [
      {
        label: "ヘルススコア (0–100)",
        detail: "リポジトリ全体の健全性を一目で",
        fallow: "full",
        knip: "none",
      },
      {
        label: "PR リスク監査 (audit)",
        detail: "変更ファイルに pass / warn / fail の判定",
        fallow: "full",
        knip: "none",
      },
      {
        label: "複雑度 (cyclomatic / cognitive)",
        detail: "関数ごとの複雑さを計測",
        fallow: "full",
        knip: "none",
      },
      {
        label: "ホットスポット",
        detail: "複雑度 × churn × 結合度でリスクを順位付け",
        fallow: "full",
        knip: "none",
      },
    ],
  },
  {
    title: "重複・アーキテクチャ",
    rows: [
      {
        label: "重複コード検出 (4モード)",
        detail: "完全一致〜変数名違いの semantic clone まで",
        fallow: "full",
        knip: "none",
      },
      {
        label: "循環依存の検出",
        detail: "モジュール間の循環参照を可視化",
        fallow: "full",
        knip: "none",
      },
      {
        label: "境界違反 / レイヤ検証",
        detail: "bulletproof・layered・hexagonal などのプリセット",
        fallow: "full",
        knip: "none",
      },
    ],
  },
  {
    title: "エンジン・連携",
    rows: [
      {
        label: "解析エンジン",
        detail: "fallow=Rust ネイティブ / knip=Node ランタイム",
        fallow: "full",
        knip: "partial",
      },
      {
        label: "フレームワークプラグイン",
        detail: "エントリ点・規約 export の自動認識",
        fallow: "full",
        knip: "full",
      },
      {
        label: "MCP / LSP / Agent Skill",
        detail: "AI エージェント・エディタへの構造化連携",
        fallow: "full",
        knip: "partial",
      },
      {
        label: "出力フォーマット",
        detail: "json / sarif / markdown / badge / codeclimate",
        fallow: "full",
        knip: "partial",
      },
      {
        label: "ランタイムインテリジェンス",
        detail: "本番の実行カバレッジを品質に反映（任意の有料層）",
        fallow: "full",
        knip: "none",
      },
    ],
  },
];

// スコープ図（包含関係）用: knip が担うのは fallow の一部分という構図。
export type ScopeLayer = {
  name: string;
  tools: ("fallow" | "knip")[];
  blurb: string;
};

export const scopeLayers: ScopeLayer[] = [
  {
    name: "デッドコード / 依存ハイジーン",
    tools: ["fallow", "knip"],
    blurb: "未使用ファイル・export・dependency。両者の重なる領域。",
  },
  {
    name: "重複コード検出",
    tools: ["fallow"],
    blurb: "4モードの clone 検出（jscpd 相当を内蔵）。",
  },
  {
    name: "複雑度 / ホットスポット / ヘルススコア",
    tools: ["fallow"],
    blurb: "コードベースを「システム」として採点・順位付け。",
  },
  {
    name: "アーキテクチャ検証",
    tools: ["fallow"],
    blurb: "循環依存・レイヤ境界違反・re-export チェーン。",
  },
  {
    name: "PR リスク監査 / ランタイム連携",
    tools: ["fallow"],
    blurb: "変更コードの判定と、本番実行エビデンスの統合。",
  },
];
