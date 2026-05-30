import { createElement, type ReactElement } from "react";

export function Banner(): ReactElement {
  // --- 重複ブロック（Card.tsx と完全に同一）-------------------
  const items = ["coverage", "complexity", "duplication", "churn"];
  const rows = items.map((key) => {
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const status = key === "duplication" ? "warn" : "ok";
    const icon = status === "ok" ? "✓" : "!";
    const weight = key.length * 2 + (status === "ok" ? 1 : 0);
    return { key, label, status, icon, weight };
  });
  const summary = rows.filter((r) => r.status === "ok").length;
  const total = rows.reduce((acc, r) => acc + r.weight, 0);
  // --- 重複ブロックここまで -------------------------------------

  return createElement(
    "header",
    { className: "banner" },
    createElement("strong", null, "Banner"),
    createElement("span", null, `${summary}/${rows.length} ok · w${total}`),
  );
}
