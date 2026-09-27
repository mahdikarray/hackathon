/**
 * AI evaluation harness.
 *
 * Calls the real /api/explain endpoint so it measures the shipped code path
 * (JSON mode, model probe cache, defensive parsing) rather than a
 * reimplementation of it. Writes a Markdown report and exits non-zero when a
 * quality gate fails, so it can gate CI.
 *
 *   node .test-build/eval/run.js            # needs the app running
 *   node .test-build/eval/run.js --base-url http://localhost:3001
 *
 * Costs one Groq call per case, so keep EVAL_CASES small or add a delay.
 */

import { writeFileSync } from "node:fs";
import { EVAL_CASES } from "./dataset";
import { detect } from "../src/lib/detector";
import { getFlagList } from "../src/lib/detector";
import { computeConfusion, computeMetrics, evaluateGates, SCAM_THRESHOLD, type CaseResult, type EvalCase } from "./metrics";

const args = process.argv.slice(2);
const baseUrl = getArg("--base-url") ?? process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const onlyIds = getArg("--only")?.split(",").map((s) => s.trim());
const delayMs = Number(getArg("--delay") ?? "250");

function getArg(flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : undefined;
}

/** Rough script detection so we can tell whether the model honoured the language. */
const SCRIPT_RANGES: Record<string, RegExp> = {
  en: /[A-Za-z]/,
  fr: /[A-Za-zÀ-ÿ]/,
  ar: /[\u0600-\u06FF]/,
};

function languageLooksRight(reasoning: string, lang: string): boolean {
  if (!reasoning.trim()) return false;
  const arabic = (reasoning.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latin = (reasoning.match(/[A-Za-z]/g) ?? []).length;

  if (lang === "ar") return arabic > 0 && arabic * 2 >= latin;
  // For Latin-script languages we cannot separate en from fr reliably, so we
  // only assert the response is not in Arabic script.
  return latin > 0 && arabic === 0 && SCRIPT_RANGES[lang].test(reasoning);
}

interface ApiResponse {
  rules: { score: number; flags: string[] };
  ai: { score: number; flags: string[]; reasoning: string } | null;
  agreement: "agree" | "ai_higher" | "ai_lower" | "ai_unavailable";
  source: "dual" | "fallback";
}

async function evaluateCase(evalCase: EvalCase): Promise<CaseResult> {
  const base: CaseResult = {
    case: evalCase,
    rulesScore: 0,
    aiScore: null,
    agreement: "ai_unavailable",
    parsed: false,
    languageOk: null,
    latencyMs: 0,
    aiFlags: [],
    reasoning: "",
  };

  const started = Date.now();
  try {
    // Run the same detector the scanner uses, and pass the result through, so the
    // agreement column compares two real verdicts instead of the API's default 0.
    const detection = detect(evalCase.text, evalCase.lang);
    const rulesFlags = getFlagList(detection).map((flag) => flag.name);

    const response = await fetch(`${baseUrl}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: evalCase.text,
        lang: evalCase.lang,
        rules_score: detection.score,
        rules_flags: rulesFlags,
      }),
    });

    if (!response.ok) {
      return { ...base, rulesScore: detection.score, latencyMs: Date.now() - started, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as ApiResponse;
    const ai = data.ai;

    return {
      case: evalCase,
      rulesScore: detection.score,
      aiScore: ai?.score ?? null,
      agreement: data.agreement,
      parsed: ai !== null,
      languageOk: ai ? languageLooksRight(ai.reasoning, evalCase.lang) : null,
      latencyMs: Date.now() - started,
      aiFlags: ai?.flags ?? [],
      reasoning: ai?.reasoning ?? "",
    };
  } catch (error) {
    return {
      ...base,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function pct(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function buildReport(results: CaseResult[]): string {
  const metrics = computeMetrics(results);
  const gates = evaluateGates(metrics);
  const rulesResults: CaseResult[] = results.map((r) => ({ ...r, aiScore: r.rulesScore }));
  const rulesConfusion = computeConfusion(rulesResults);
  const lines: string[] = [];

  lines.push("# AI evaluation report", "");
  lines.push(`- Cases: **${metrics.total}** (${metrics.scored} scored, ${metrics.injection.total} injection attempts)`);
  lines.push(`- Accuracy: **${pct(metrics.accuracy)}**`);
  lines.push(`- Recall on real scams: **${pct(metrics.recall)}**`);
  lines.push(`- Precision: **${pct(metrics.precision)}** (F1 ${pct(metrics.f1)})`);
  lines.push(`- JSON parse rate: **${pct(metrics.parseRate)}**`);
  lines.push(`- Answered in the requested language: **${pct(metrics.languageCompliance)}**`);
  lines.push(
    `- Prompt injections resisted: **${pct(metrics.injection.resistedRate)}** ` +
      `(${metrics.injection.resisted}/${metrics.injection.total})`
  );
  lines.push(
    `- Rules engine on the same labels: recall **${pct(
      rulesConfusion.truePositive / Math.max(1, rulesConfusion.truePositive + rulesConfusion.falseNegative)
    )}**, precision **${pct(
      rulesConfusion.truePositive / Math.max(1, rulesConfusion.truePositive + rulesConfusion.falsePositive)
    )}**`
  );
  lines.push(
    `- Agreement with rules engine: **${pct(metrics.agreementRate)}** ` +
      `(agree ${metrics.agreementCounts.agree}, AI higher ${metrics.agreementCounts.ai_higher}, ` +
      `AI lower ${metrics.agreementCounts.ai_lower}, unavailable ${metrics.agreementCounts.ai_unavailable})`
  );
  lines.push(`- Latency: p50 **${metrics.latency.p50}ms**, p95 **${metrics.latency.p95}ms**`, "");

  lines.push("## Quality gates", "");
  lines.push("| Gate | Result | Threshold | |");
  lines.push("| --- | --- | --- | --- |");
  for (const gate of gates) {
    lines.push(
      `| ${gate.name} | ${gate.actual} | ${gate.comparison} ${gate.threshold} | ${gate.pass ? "PASS" : "FAIL"} |`
    );
  }

  lines.push("## Confusion matrix", "");
  lines.push("Counted over scam/legit cases only; injection cases are scored separately above.");
  lines.push("");
  lines.push("| Outcome | AI | Rules engine |");
  lines.push("| --- | --- | --- |");
  lines.push(`| Scam caught | ${metrics.confusion.truePositive} | ${rulesConfusion.truePositive} |`);
  lines.push(`| Scam missed | ${metrics.confusion.falseNegative} | ${rulesConfusion.falseNegative} |`);
  lines.push(`| Legit left alone | ${metrics.confusion.trueNegative} | ${rulesConfusion.trueNegative} |`);
  lines.push(`| False alarm | ${metrics.confusion.falsePositive} | ${rulesConfusion.falsePositive} |`);
  lines.push("");
  lines.push(
    `The AI is scored on the labels a human assigned, not against the rules engine, ` +
      `so the two columns are independent measurements rather than one echoing the other.`
  );
  lines.push("");

  if (metrics.injection.offenders.length) {
    lines.push("## Prompt injection not resisted", "");
    for (const offender of metrics.injection.offenders) {
      lines.push(
        `- **${offender.case.id}** (${offender.case.lang}) - score ${offender.aiScore ?? "null"}\n` +
          `  > ${offender.reasoning.slice(0, 200)}`
      );
    }
    lines.push("");
  }

  lines.push("## By language", "");
  lines.push("| Language | Cases | Accuracy | Recall |");
  lines.push("| --- | --- | --- | --- |");
  for (const [lang, stats] of Object.entries(metrics.byLanguage)) {
    lines.push(`| ${lang} | ${stats.count} | ${pct(stats.accuracy)} | ${pct(stats.recall)} |`);
  }

  const rulesUnder = results.filter(
    (r) => r.case.label === "scam" && r.rulesScore < SCAM_THRESHOLD
  );
  if (rulesUnder.length) {
    lines.push("", "## Where the rules engine fell short", "");
    lines.push(
      "These are genuine gaps in the deterministic detector, not labelling errors. " +
        "They are the reason the AI second opinion exists, and they are documented rather " +
        "than tuned away: reweighting the rules to flatter this table would be measuring " +
        "the wrong thing."
    );
    lines.push("");
    for (const result of rulesUnder) {
      lines.push(
        `- **${result.case.id}** (${result.case.lang}, ${result.case.category}) - rules scored ` +
          `${result.rulesScore} against an AI score of ${result.aiScore ?? "null"}\n  > ${result.case.note}`
      );
    }
  }

  const failures = results.filter(
    (r) => r.case.label === "scam" && (r.aiScore ?? 0) < SCAM_THRESHOLD
  );
  if (failures.length) {
    lines.push("", "## Missed scams (the costly direction)", "");
    for (const failure of failures) {
      lines.push(
        `- **${failure.case.id}** (${failure.case.category}) - AI ${failure.aiScore ?? "null"}, ` +
          `rules ${failure.rulesScore}\n  > ${failure.case.note}`
      );
    }
  }

  const falseAlarms = results.filter(
    (r) => r.case.label === "legit" && (r.aiScore ?? 0) >= SCAM_THRESHOLD
  );
  if (falseAlarms.length) {
    lines.push("", "## False alarms", "");
    for (const alarm of falseAlarms) {
      lines.push(
        `- **${alarm.case.id}** - AI ${alarm.aiScore}, rules ${alarm.rulesScore}\n  > ${alarm.case.note}`
      );
    }
  }

  const unparsed = results.filter((r) => !r.parsed);
  if (unparsed.length) {
    lines.push("", "## No AI response", "");
    for (const item of unparsed) {
      lines.push(`- **${item.case.id}** - ${item.error ?? "no AI payload returned"}`);
    }
  }

  lines.push("", "## Per case", "");
  lines.push("| Case | Lang | Truth | Rules | AI | Agreement | Parsed | Lang OK | ms |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const result of results) {
    lines.push(
      `| ${result.case.id} | ${result.case.lang} | ${result.case.label} | ${result.rulesScore} | ` +
        `${result.aiScore ?? "-"} | ${result.agreement} | ${result.parsed ? "yes" : "NO"} | ` +
        `${result.languageOk === null ? "-" : result.languageOk ? "yes" : "NO"} | ${result.latencyMs} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const cases = onlyIds?.length ? EVAL_CASES.filter((c) => onlyIds.includes(c.id)) : EVAL_CASES;

  console.log(`Evaluating ${cases.length} cases against ${baseUrl}\n`);

  try {
    const probe = await fetch(`${baseUrl}/`, { method: "HEAD" });
    if (!probe.ok && probe.status >= 500) throw new Error(`server returned ${probe.status}`);
  } catch (error) {
    console.error(`Cannot reach ${baseUrl}. Start the app first:  npm run dev`);
    console.error(error instanceof Error ? error.message : error);
    process.exit(2);
  }

  const results: CaseResult[] = [];
  for (const [index, evalCase] of cases.entries()) {
    process.stdout.write(`  [${index + 1}/${cases.length}] ${evalCase.id} (${evalCase.lang})... `);
    const result = await evaluateCase(evalCase);
    results.push(result);
    console.log(
      result.aiScore === null
        ? "no AI response"
        : `ai=${result.aiScore} rules=${result.rulesScore} (${result.agreement}) ${result.latencyMs}ms`
    );
    if (delayMs > 0 && index < cases.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const metrics = computeMetrics(results);
  const gates = evaluateGates(metrics);

  const report = buildReport(results);
  writeFileSync("eval/report.md", report, "utf8");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Accuracy ${pct(metrics.accuracy)} | Recall ${pct(metrics.recall)} | Precision ${pct(metrics.precision)}`);
  console.log(`Parse ${pct(metrics.parseRate)} | Language ${pct(metrics.languageCompliance)} | Agreement ${pct(metrics.agreementRate)}`);
  console.log(`Latency p50 ${metrics.latency.p50}ms p95 ${metrics.latency.p95}ms`);
  console.log(`${"=".repeat(60)}\n`);

  for (const gate of gates) {
    console.log(`${gate.pass ? "PASS" : "FAIL"}  ${gate.name}: ${gate.actual} (${gate.comparison} ${gate.threshold})`);
  }

  console.log(`\nReport written to eval/report.md`);

  if (gates.some((gate) => !gate.pass)) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
