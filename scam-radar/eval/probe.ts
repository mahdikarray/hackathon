/**
 * Probes a single case N times to measure run-to-run variance.
 * Usage: node .test-build/eval/probe.js <caseId> [runs]
 */
const { EVAL_CASES } = require("./dataset");
import type { EvalCase } from "./metrics";

interface ApiShape {
  ai: { score: number; reasoning: string } | null;
  source: string;
}

const baseUrl = process.env.EVAL_BASE_URL || "http://localhost:3000";
const id = process.argv[2];
const runs = Number(process.argv[3] || 5);

(async () => {
  const evalCase: EvalCase | undefined = EVAL_CASES.find((c: EvalCase) => c.id === id);
  if (!evalCase) {
    console.error(`unknown case ${id}`);
    process.exit(2);
  }

  console.log(`${id} (${evalCase.lang}, truth=${evalCase.label}) x${runs}`);
  console.log(`text: ${evalCase.text.slice(0, 90)}...\n`);

  const scores = [];
  for (let i = 0; i < runs; i++) {
    const started = Date.now();
    try {
      const res = await fetch(`${baseUrl}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: evalCase.text, lang: evalCase.lang }),
      });
      const data = (await res.json()) as ApiShape;
      const score = data.ai ? data.ai.score : null;
      scores.push(score);
      console.log(
        `  run ${i + 1}: score=${score} (${Date.now() - started}ms) ${data.source}`
      );
      if (data.ai) console.log(`     ${data.ai.reasoning.slice(0, 130)}`);
    } catch (e) {
      scores.push(null);
      console.log(`  run ${i + 1}: ERROR ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const valid = scores.filter((s) => typeof s === "number");
  if (valid.length) {
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    console.log(`\n  min=${min} max=${max} spread=${max - min}`);
    const flipped = valid.filter((s) => s >= 30).length !== valid.filter((s) => s < 30).length
      ? "THRESHOLD-CROSSING VARIANCE" : "";
    if (flipped) console.log(`  WARNING: ${flipped}`);
  }
})();
