import { helperA } from "./moduleA";

export function syncB(): string {
  return `B:${helperA()}`;
}
