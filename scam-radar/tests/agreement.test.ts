import test from "node:test";
import assert from "node:assert/strict";
import { computeAgreement, AGREEMENT_TOLERANCE } from "../src/lib/agreement";

test("identical scores agree", () => {
  assert.equal(computeAgreement(50, 50), "agree");
  assert.equal(computeAgreement(0, 0), "agree");
  assert.equal(computeAgreement(100, 100), "agree");
});

test("differences inside the tolerance agree", () => {
  assert.equal(computeAgreement(50, 50 + AGREEMENT_TOLERANCE), "agree");
  assert.equal(computeAgreement(50, 50 - AGREEMENT_TOLERANCE), "agree");
  assert.equal(computeAgreement(20, 35), "agree");
});

test("differences beyond the tolerance are flagged", () => {
  assert.equal(computeAgreement(50, 50 + AGREEMENT_TOLERANCE + 1), "ai_higher");
  assert.equal(computeAgreement(50, 50 - AGREEMENT_TOLERANCE - 1), "ai_lower");
});

test("a large AI score is ai_higher, a large rules score is ai_lower", () => {
  assert.equal(computeAgreement(10, 90), "ai_higher");
  assert.equal(computeAgreement(90, 10), "ai_lower");
});

test("a missing AI result is never reported as agreement", () => {
  assert.equal(computeAgreement(70, null), "ai_unavailable");
  assert.equal(computeAgreement(0, null), "ai_unavailable");
  assert.equal(computeAgreement(100, null), "ai_unavailable");
});

test("NaN from a failed AI call degrades to unavailable", () => {
  assert.equal(computeAgreement(50, Number.NaN), "ai_unavailable");
});
