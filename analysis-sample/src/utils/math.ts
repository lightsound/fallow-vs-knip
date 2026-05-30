export type Metrics = {
  coverage: number;
  complexity: number;
  duplication: number;
  churn: number;
  dependencies: number;
  openIssues: number;
};

// 意図的に分岐の多い関数。循環的複雑度・認知的複雑度が高く、
// fallow は「複雑度ホットスポット」として検出する（knip は対象外）。
export function computeHealthScore(m: Metrics): number {
  let score = 100;

  if (m.coverage < 50) score -= 30;
  else if (m.coverage < 70) score -= 18;
  else if (m.coverage < 85) score -= 8;
  else if (m.coverage < 95) score -= 2;

  if (m.complexity > 30) score -= 25;
  else if (m.complexity > 20) score -= 15;
  else if (m.complexity > 12) score -= 8;
  else if (m.complexity > 6) score -= 3;

  if (m.duplication > 10) score -= 20;
  else if (m.duplication > 5) score -= 10;
  else if (m.duplication > 2) score -= 4;

  if (m.churn > 50) score -= 12;
  else if (m.churn > 25) score -= 6;

  switch (true) {
    case m.dependencies > 80:
      score -= 10;
      break;
    case m.dependencies > 50:
      score -= 5;
      break;
    case m.dependencies > 30:
      score -= 2;
      break;
    default:
      break;
  }

  if (m.openIssues > 20 && m.churn > 30) score -= 8;
  else if (m.openIssues > 10) score -= 4;
  else if (m.openIssues > 5) score -= 2;

  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return score / 100;
}
