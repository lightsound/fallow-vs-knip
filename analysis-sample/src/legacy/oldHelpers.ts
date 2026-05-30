// このファイルはどこからも import されていない（未使用ファイル）。
// knip も fallow も「未使用ファイル」として検出する。

export function deprecatedSlugify(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "-");
}

export function deprecatedTruncate(input: string, max: number): string {
  return input.length > max ? `${input.slice(0, max)}…` : input;
}
