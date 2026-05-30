import { renderDashboard } from "./App";
import { computeHealthScore } from "./utils/math";
import { formatCurrency } from "./utils/format";
import { startSync } from "./services/moduleA";
import { Card } from "./components/Card";
import { Banner } from "./components/Banner";

const score = computeHealthScore({
  coverage: 82,
  complexity: 14,
  duplication: 3,
  churn: 27,
  dependencies: 48,
  openIssues: 5,
});

renderDashboard({
  title: "Project Health",
  subtitle: formatCurrency(score * 1000),
  widgets: [Card, Banner],
});

startSync();
