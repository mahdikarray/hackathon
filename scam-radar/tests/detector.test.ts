import test from "node:test";
import assert from "node:assert/strict";
import { detect, getFlagList } from "../src/lib/detector";
import { RULES, SAFE_PRACTICE_PATTERNS } from "../src/lib/rules";

const weightOf = (id: string) => RULES.find((r) => r.id === id)!.weight;

test("empty input is low risk with no flags", () => {
  for (const input of ["", "   ", "\n\t "]) {
    const result = detect(input, "en");
    assert.equal(result.score, 0);
    assert.equal(result.level, "low");
    assert.deepEqual(result.matches, []);
  }
});

test("an obvious English scam scores high", () => {
  const result = detect(
    "URGENT: Your account will be closed in 2 hours! Click here to verify your identity immediately: bit.ly/verify-account",
    "en"
  );
  assert.equal(result.level, "high");
  assert.ok(result.score >= 60, `expected >= 60, got ${result.score}`);
  for (const id of ["urgency", "credential_request", "suspicious_link"]) {
    assert.ok(result.triggeredRuleIds.includes(id), `expected ${id}`);
  }
});

test("a legitimate English message scores low", () => {
  const result = detect(
    "Your monthly statement is ready. View it securely at: bankofamerica.com/statements",
    "en"
  );
  assert.equal(result.score, 0);
  assert.equal(result.level, "low");
  assert.deepEqual(result.triggeredRuleIds, []);
});

test("scoring is the sum of triggered rule weights", () => {
  // "urgent" (urgency) + "bit.ly" (suspicious_link). Two rules, so no +10 bonus.
  const result = detect("URGENT click bit.ly", "en");
  const expected = weightOf("urgency") + weightOf("suspicious_link");
  assert.deepEqual(result.triggeredRuleIds.sort(), ["suspicious_link", "urgency"]);
  assert.equal(result.score, expected);
  assert.equal(result.score, 33);
});

test("three or more triggered rules add a 10 point bonus", () => {
  const result = detect("URGENT click bit.ly", "en");
  assert.equal(result.triggeredRuleIds.length, 2);

  const scam = detect(
    "URGENT: click here to verify your identity and send your password: bit.ly/x",
    "en"
  );
  const base = scam.triggeredRuleIds.reduce((sum, id) => sum + weightOf(id), 0);
  assert.ok(scam.triggeredRuleIds.length >= 3);
  assert.equal(scam.score, base + 10);
});

test("a safe-practice phrase subtracts 15 points", () => {
  const risky = detect("URGENT click bit.ly", "en");
  const softened = detect("URGENT click bit.ly verified", "en");
  assert.equal(softened.score, Math.max(0, risky.score - 15));
  assert.equal(softened.score, 18);
});

test("score is clamped at zero, never negative", () => {
  const result = detect("urgent verified", "en");
  assert.equal(result.score, 0);
  assert.equal(result.level, "low");
});

test("repeated scans of the same text are deterministic", () => {
  // Guards against stateful /g regexes leaking lastIndex between calls, which
  // made the safe-practice penalty apply on some scans and not others.
  const text = "URGENT click bit.ly verified";
  const first = detect(text, "en");
  for (let i = 0; i < 5; i++) {
    assert.deepEqual(detect(text, "en"), first, `scan ${i + 1} differed from the first`);
  }
});

test("interleaving different texts does not change results", () => {
  const risky = "URGENT click bit.ly";
  const soft = "URGENT click bit.ly verified";
  const expectedRisky = detect(risky, "en");
  const expectedSoft = detect(soft, "en");

  for (let i = 0; i < 3; i++) {
    detect(soft, "en");
    detect(risky, "en");
    assert.deepEqual(detect(risky, "en"), expectedRisky);
    assert.deepEqual(detect(soft, "en"), expectedSoft);
  }
});

test("score is clamped at 100", () => {
  const result = detect(
    "URGENT: click here to verify your identity. Send your password and PIN now. You have won the prize, " +
      "pay the processing fee with a gift card. Your account is frozen, legal action will follow. This is bank " +
      "security. Guaranteed returns, no risk. Don't tell anyone. New phone number, it is your mother.",
    "en"
  );
  assert.ok(result.score <= 100);
  assert.equal(result.level, "high");
});

test("level thresholds follow 0-29 low, 30-59 medium, 60+ high", () => {
  assert.equal(detect("URGENT click bit.ly", "en").level, "medium");
  assert.equal(detect("verify your identity", "en").level, "low");
  assert.equal(
    detect(
      "URGENT: click here to verify your identity and send your password: bit.ly/x",
      "en"
    ).level,
    "high"
  );
});

test("every match index slices back to its own phrase", () => {
  const text =
    "URGENT: click here to verify your identity and send your password: bit.ly/x";
  const result = detect(text, "en");
  assert.ok(result.matches.length > 0);
  for (const match of result.matches) {
    assert.equal(text.slice(match.start, match.end), match.phrase);
  }
});

test("matches are returned in ascending position order", () => {
  const result = detect(
    "URGENT: click here to verify your identity and send your password: bit.ly/x",
    "en"
  );
  const starts = result.matches.map((m) => m.start);
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
});

test("overlapping matches from different rules are still individually addressable", () => {
  const text = "URGENT: click here to verify your identity: bit.ly/x";
  const result = detect(text, "en");
  for (const match of result.matches) {
    assert.ok(match.end > match.start, "match must be non-empty");
    assert.ok(match.end <= text.length, "match must stay in bounds");
  }
});

test("getFlagList mirrors the triggered rules and their weights", () => {
  const result = detect("URGENT click bit.ly", "en");
  const flags = getFlagList(result);
  assert.equal(flags.length, result.triggeredRuleIds.length);
  for (const flag of flags) {
    assert.equal(flag.weight, weightOf(flag.id));
    assert.ok(flag.name.length > 0);
  }
});

// --- French regressions -----------------------------------------------------
// French patterns cannot use \b because JavaScript treats accented characters as
// non-word characters, so rules.ts uses an explicit boundary class instead. The
// next two tests fail if that boundary or its grouping regresses.

test("FR: accented keywords match mid-sentence", () => {
  const result = detect("Bonjour, veuillez.matcher immédiatement", "fr");
  assert.ok(
    result.triggeredRuleIds.includes("urgency"),
    `expected urgency, got ${JSON.stringify(result.triggeredRuleIds)}`
  );
});

test("FR: accented multi-word keywords match mid-sentence", () => {
  const result = detect("Bonjour, votre code pin est requis", "fr");
  assert.ok(
    result.triggeredRuleIds.includes("credential_request"),
    "expected credential_request for a mid-sentence accented keyword"
  );
});

test("FR: a fully accented scam scores high", () => {
  const result = detect(
    "URGENT : Votre compte sera fermé. Vérifiez votre mot de passe immédiatement : bit.ly/x",
    "fr"
  );
  assert.equal(result.level, "high");
  assert.ok(result.score >= 60, `expected >= 60, got ${result.score}`);
});

test("FR: a legitimate message scores low", () => {
  const result = detect(
    "Votre relevé mensuel est prêt. Consultez-le sur bankofamerica.com/statements",
    "fr"
  );
  assert.equal(result.score, 0);
  assert.equal(result.level, "low");
});

test("FR: keywords are not matched inside a longer word", () => {
  assert.equal(detect("lurgentxyz apparait ici", "fr").triggeredRuleIds.length, 0);
  assert.equal(detect("an spinal note", "fr").triggeredRuleIds.length, 0);
});

test("FR: every match index slices back to its own phrase", () => {
  const text = "Bonjour, votre code pin est requis. Cliquez ici : bit.ly/x";
  for (const match of detect(text, "fr").matches) {
    assert.equal(text.slice(match.start, match.end), match.phrase);
  }
});

// --- Arabic -----------------------------------------------------------------
// Arabic scripts have no \b support, so these patterns match on the script
// itself. Earlier revisions only matched "أرسل لي ..." and scored obvious
// credential phishing as low risk, so cover the natural phrasings.

test("AR: a bare credential request is not low risk", () => {
  const result = detect("عاجل: أرسل كلمة المرور الآن", "ar");
  assert.ok(
    result.triggeredRuleIds.includes("credential_request"),
    `expected credential_request, got ${JSON.stringify(result.triggeredRuleIds)}`
  );
  assert.notEqual(result.level, "low", "a password request must not read as low risk");
});

test("AR: credential requests match without a hamza and without a pronoun", () => {
  const withoutHamza = detect("ارسل رمز التحقق فورا", "ar");
  assert.ok(withoutHamza.triggeredRuleIds.includes("credential_request"));
  assert.notEqual(withoutHamza.level, "low");
});

test("AR: bank impersonation with a secret number is not low risk", () => {
  const result = detect("هذا أمن البنك، اكد حسابك برقمك السري", "ar");
  assert.notEqual(result.level, "low", `got ${result.level} at ${result.score}`);
  assert.ok(result.triggeredRuleIds.length >= 2);
});

test("AR: a legitimate message scores low", () => {
  const bill = detect(
    "فاتورة الكهرباء الخاصة بك 127.50 دولار مستحقة في 20 ديسمبر. ادفع على pge.com/pay",
    "ar"
  );
  assert.equal(bill.score, 0);
  assert.equal(bill.level, "low");

  const receipt = detect("إيصال رحلتك مع Uber: 18.50 دولار. شكرا لركوبك مع Uber", "ar");
  assert.equal(receipt.score, 0);
  assert.equal(receipt.level, "low");
});

test("AR: every match index slices back to its own phrase", () => {
  const text = "عاجل: أرسل كلمة المرور الآن على bank-security.com";
  for (const match of detect(text, "ar").matches) {
    assert.equal(text.slice(match.start, match.end), match.phrase);
  }
});

// --- Structural guarantees -------------------------------------------------

test("every rule declares patterns for all three languages", () => {
  for (const rule of RULES) {
    for (const lang of ["en", "fr", "ar"] as const) {
      assert.ok(
        rule.patterns[lang].length > 0,
        `rule ${rule.id} is missing ${lang} patterns`
      );
    }
  }
});

test("safe-practice patterns exist for all three languages", () => {
  for (const lang of ["en", "fr", "ar"] as const) {
    assert.ok(SAFE_PRACTICE_PATTERNS[lang].length > 0, `missing safe patterns for ${lang}`);
  }
});

test("no Arabic pattern uses \\b, which breaks on Arabic script", () => {
  for (const rule of RULES) {
    for (const pattern of rule.patterns.ar) {
      assert.ok(!pattern.source.includes("\\b"), `rule ${rule.id} uses \\b in its Arabic pattern`);
    }
  }
});

test("rule ids and weights are unique and positive", () => {
  const ids = new Set(RULES.map((r) => r.id));
  assert.equal(ids.size, RULES.length, "duplicate rule id");
  for (const rule of RULES) {
    assert.ok(rule.weight > 0, `rule ${rule.id} has a non-positive weight`);
  }
});
