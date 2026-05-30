import { syncB } from "./moduleB";

// moduleA → moduleB → moduleA の循環依存。
// fallow は循環依存として検出する（knip は対象外）。
export function startSync(): string {
  return `A:${syncB()}`;
}

export function helperA(): string {
  return "helper-a";
}
