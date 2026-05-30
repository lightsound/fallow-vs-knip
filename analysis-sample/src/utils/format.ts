const JPY = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

export function formatCurrency(value: number): string {
  return JPY.format(Math.round(value));
}

// index.ts からは formatCurrency しか使われていないため、これは未使用 export。
// knip も fallow も「未使用 export」として検出する。
export function formatLegacy(value: number): string {
  return `¥${value.toFixed(0)}`;
}
