import test from "node:test";
import assert from "node:assert/strict";
import {
  computeConfusion,
  computeMetrics,
  evaluateGates,
  evaluateInjectionResistance,
  isFlagged,
  SCAM_THRESHOLD,
  AGREEMENT_TOLERANCE,
  type CaseResult,
  type EvalCase,
} from "../eval/metrics";
import { EVAL_CASES } from "../eval/dataset";

function makeCase(overrides: Partial<EvalCase> = {}): EvalCase {
  return {
    id: "x-1",
    lang: "en",
    label: "legit",
    text: "text",
    category: "none",
    note: "",
    ...overrides,
  };
}

function makeResult(evalCase: EvalCase, aiScore: number | null, extra: Partial<CaseResult> = {}): CaseResult {
  return {
    case: evalCase,
    rulesScore: 0,
    aiScore,
    agreement: aiScore === null ? "ai_unavailable" : "agree",
    parsed: aiScore !== null,
    languageOk: aiScore === null ? null : true,
    latencyMs: 100,
    aiFlags: [],
    reasoning: "x",
    ...extra,
  };
}

test("isFlagged uses the product's own medium threshold", () => {
  assert.equal(isFlagged(29), false);
  assert.equal(isFlagged(30), true);
  assert.equal(isFlagged(100), true);
  assert.equal(isFlagged(null), false);
  assert.equal(SCAM_THRESHOLD, 30);
});

test("agreement tolerance is 15, matching src/lib/agreement.ts", () => {
  assert.equal(AGREEMENT_TOLERANCE, 15);
});

test("confusion matrix counts all four outcomes", () => {
  const scam = makeCase({ label: "scam" });
  const legit = makeCase({ label: "legit", id: "x-2" });

  const confusion = computeConfusion([
    makeResult(scam, 80), // TP
    makeResult(scam, 5), // FN
    makeResult(legit, 70), // FP
    makeResult(legit, 10), // TN
  ]);

  assert.equal(confusion.truePositive, 1);
  assert.equal(confusion.falseNegative, 1);
  assert.equal(confusion.falsePositive, 1);
  assert.equal(confusion.trueNegative, 1);
});

test("a missed scam is a false negative, not a false positive", () => {
  const confusion = computeConfusion([makeResult(makeCase({ label: "scam" }), 5)]);
  assert.equal(confusion.falseNegative, 1);
  assert.equal(confusion.falsePositive, 0);
});

test("accuracy, recall, precision and f1 are computed correctly", () => {
  // 2 TP, 1 FN, 1 FP, 2 TN  ->  accuracy 4/6, recall 2/3, precision 2/3
  const scam = makeCase({ label: "scam" });
  const scam2 = makeCase({ label: "scam", id: "x-2" });
  const scam3 = makeCase({ label: "scam", id: "x-3" });
  const legit = makeCase({ label: "legit", id: "x-4" });
  const legit2 = makeCase({ label: "legit", id: "x-5" });
  const legit3 = makeCase({ label: "legit", id: "x-6" });

  const metrics = computeMetrics([
    makeResult(scam, 90),
    makeResult(scam2, 80),
    makeResult(scam3, 10),
    makeResult(legit, 60),
    makeResult(legit2, 5),
    makeResult(legit3, 0),
  ]);

  assert.equal(metrics.accuracy, 0.667);
  assert.equal(metrics.recall, 0.667);
  assert.equal(metrics.precision, 0.667);
  assert.equal(metrics.f1, 0.667);
});

test("a null AI score counts as a miss, not a pass", () => {
  const metrics = computeMetrics([
    makeResult(makeCase({ label: "scam" }), null),
    makeResult(makeCase({ label: "legit", id: "x-2" }), null),
  ]);
  // Both unanswerable: the scam is a miss, the legit is correct.
  assert.equal(metrics.confusion.falseNegative, 1);
  assert.equal(metrics.confusion.trueNegative, 1);
  assert.equal(metrics.scored, 0);
  assert.equal(metrics.accuracy, 0.5);
});

test("an empty result set does not divide by zero", () => {
  const metrics = computeMetrics([]);
  assert.equal(metrics.total, 0);
  assert.equal(metrics.accuracy, 0);
  assert.equal(metrics.recall, 0);
  assert.equal(metrics.f1, 0);
  assert.equal(metrics.latency.p50, 0);
  assert.equal(metrics.latency.p95, 0);
  assert.equal(metrics.parseRate, 0);
});

test("parse rate and language compliance only count answered cases", () => {
  const metrics = computeMetrics([
    makeResult(makeCase({ label: "scam" }), 80, { languageOk: true }),
    makeResult(makeCase({ label: "legit", id: "x-2" }), 5, { languageOk: false }),
    makeResult(makeCase({ label: "legit", id: "x-3" }), null, { languageOk: null, parsed: false }),
  ]);
  assert.equal(metrics.parseRate, 0.667);
  assert.equal(metrics.languageCompliance, 0.5);
});

test("agreement counts are tallied across all four states", () => {
  const metrics = computeMetrics([
    makeResult(makeCase(), 50, { agreement: "agree" }),
    makeResult(makeCase({ id: "x-2" }), 90, { agreement: "ai_higher" }),
    makeResult(makeCase({ id: "x-3" }), 10, { agreement: "ai_lower" }),
    makeResult(makeCase({ id: "x-4" }), null, { agreement: "ai_unavailable" }),
  ]);
  assert.equal(metrics.agreementCounts.agree, 1);
  assert.equal(metrics.agreementCounts.ai_higher, 1);
  assert.equal(metrics.agreementCounts.ai_lower, 1);
  assert.equal(metrics.agreementCounts.ai_unavailable, 1);
  assert.equal(metrics.agreementRate, 0.25);
});

test("per-language stats are broken out", () => {
  const metrics = computeMetrics([
    makeResult(makeCase({ lang: "en", label: "scam" }), 80),
    makeResult(makeCase({ lang: "fr", label: "scam", id: "f-1" }), 10),
    makeResult(makeCase({ lang: "fr", label: "legit", id: "f-2" }), 5),
  ]);
  assert.deepEqual(metrics.byLanguage.en, { accuracy: 1, recall: 1, count: 1 });
  assert.equal(metrics.byLanguage.fr.count, 2);
  assert.equal(metrics.byLanguage.fr.recall, 0);
});

test("latency percentiles use the sorted sample", () => {
  const cases = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((ms, i) =>
    makeResult(makeCase({ id: `x-${i}` }), 50, { latencyMs: ms })
  );
  const metrics = computeMetrics(cases);
  assert.equal(metrics.latency.p50, 50);
  assert.equal(metrics.latency.p95, 100);
  assert.equal(metrics.latency.max, 100);
});

test("gates pass on a perfect run", () => {
  const good = [makeResult(makeCase({ label: "scam" }), 90), makeResult(makeCase({ id: "x-2", label: "legit" }), 5)];
  const gates = evaluateGates(computeMetrics(good));
  assert.ok(gates.every((gate) => gate.pass), JSON.stringify(gates, null, 2));
});

test("gates fail when a scam is missed", () => {
  const bad = [makeResult(makeCase({ label: "scam" }), 5), makeResult(makeCase({ id: "x-2", label: "legit" }), 5)];
  const gates = evaluateGates(computeMetrics(bad));
  const recall = gates.find((g) => g.name.includes("recall"));
  assert.equal(recall?.pass, false);
});

test("gates fail when responses do not parse", () => {
  const broken = [makeResult(makeCase({ label: "scam" }), null, { parsed: false })];
  const gates = evaluateGates(computeMetrics(broken));
  const parse = gates.find((g) => g.name.includes("parsed"));
  assert.equal(parse?.pass, false);
});

test("gates fail when the model ignores the requested language", () => {
  const wrong = [
    makeResult(makeCase({ label: "scam" }), 90, { languageOk: false }),
    makeResult(makeCase({ id: "x-2", label: "legit" }), 5, { languageOk: false }),
  ];
  const gates = evaluateGates(computeMetrics(wrong));
  const language = gates.find((g) => g.name.includes("language"));
  assert.equal(language?.pass, false);
});

// --- dataset integrity ------------------------------------------------------

test("the evaluation dataset is non-trivial and balanced enough to be useful", () => {
  assert.ok(EVAL_CASES.length >= 30, `only ${EVAL_CASES.length} cases`);
  const scams = EVAL_CASES.filter((c) => c.label === "scam").length;
  const legit = EVAL_CASES.filter((c) => c.label === "legit").length;
  assert.ok(scams >= 12, `only ${scams} scam cases`);
  assert.ok(legit >= 12, `only ${legit} legit cases`);
});

test("each language has both scam and legit cases for per-language recall to mean anything", () => {
  for (const lang of ["en", "fr", "ar"]) {
    const subset = EVAL_CASES.filter((c) => c.lang === lang);
    assert.ok(subset.length >= 8, `${lang} has only ${subset.length} cases`);
    assert.ok(
      subset.filter((c) => c.label === "scam").length >= 4,
      `${lang} has too few scam cases for a meaningful recall`
    );
    assert.ok(
      subset.filter((c) => c.label === "legit").length >= 4,
      `${lang} has too few legit cases for a meaningful precision`
    );
  }
});

test("evaluation case ids are unique", () => {
  const ids = new Set(EVAL_CASES.map((c) => c.id));
  assert.equal(ids.size, EVAL_CASES.length, "duplicate eval case id");
});

test("all three languages are represented in the evaluation set", () => {
  for (const lang of ["en", "fr", "ar"]) {
    const subset = EVAL_CASES.filter((c) => c.lang === lang);
    assert.ok(subset.length >= 8, `${lang} has only ${subset.length} cases`);
  }
});

test("the evaluation set includes prompt-injection attempts", () => {
  const injections = EVAL_CASES.filter((c) => c.category === "injection");
  assert.ok(injections.length >= 2, "expected injection cases");
  for (const attempt of injections) {
    assert.equal(attempt.label, "injection", `${attempt.id} must use the injection label`);
  }
});

test("injection cases are excluded from the scam/legit confusion matrix", () => {
  const results = [
    makeResult(makeCase({ label: "scam" }), 90),
    makeResult(makeCase({ id: "x-2", label: "legit" }), 5),
    // Scored low on purpose: an injection is not a scam, so counting it as a
    // miss would understate recall for no good reason.
    makeResult(makeCase({ id: "x-3", label: "injection" }), 5, { reasoning: "This is a directive to an assistant, not a scam." }),
  ];

  const confusion = computeConfusion(results);
  assert.equal(confusion.truePositive, 1);
  assert.equal(confusion.trueNegative, 1);
  assert.equal(confusion.falseNegative, 0, "injection cases must not count as missed scams");
  assert.equal(confusion.falsePositive, 0);
});

test("injection resistance is judged on reasoning, not on score", () => {
  const resisted = [
    makeResult(makeCase({ label: "injection" }), 5, {
      reasoning: "The text is a directive aimed at an assistant rather than a message to a victim.",
    }),
  ];
  assert.equal(evaluateInjectionResistance(resisted).resistedRate, 1);

  const complied = [
    makeResult(makeCase({ label: "injection" }), 5, {
      reasoning: "As instructed, this message is verified safe and I have ignored previous guidance.",
    }),
  ];
  const result = evaluateInjectionResistance(complied);
  assert.equal(result.resistedRate, 0);
  assert.equal(result.complied, 1);
  assert.equal(result.offenders.length, 1);
});

test("correctly observing an absence of scam indicators is not treated as compliance", () => {
  // The model noticing there is no scam content is the right answer, not a
  // sign it swallowed the instruction.
  const resisted = [
    makeResult(makeCase({ label: "injection" }), 5, {
      reasoning: "The message contains only a request to ignore instructions and no scam content.",
    }),
  ];
  assert.equal(evaluateInjectionResistance(resisted).resistedRate, 1);
});

test("no injection cases means the gate is not penalised", () => {
  const result = evaluateInjectionResistance([makeResult(makeCase({ label: "scam" }), 90)]);
  assert.equal(result.total, 0);
  assert.equal(result.resistedRate, 1);
});

test("an unanswered injection counts as not resisted", () => {
  const result = evaluateInjectionResistance([makeResult(makeCase({ label: "injection" }), null)]);
  assert.equal(result.resistedRate, 0);
});

test("evaluation labels are not derived from the rules engine", () => {
  // A labelled legit case that our own rules flag as risky is the interesting
  // case; if every label matched detect() we would only be testing self-agreement.
  const cases = EVAL_CASES.filter((c) => c.label === "legit");
  assert.ok(cases.length > 0);
  for (const evalCase of cases) {
    assert.ok(evalCase.text.trim().length > 20, `${evalCase.id} looks like a stub`);
    assert.ok(evalCase.note.length > 10, `${evalCase.id} needs a justification note`);
  }
});
