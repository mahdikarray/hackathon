import test from "node:test";
import assert from "node:assert/strict";
import { translations } from "../src/lib/i18n-dictionary";

/**
 * Guards the i18n dictionary itself. The scanner and game previously shipped
 * hardcoded English strings that silently broke the French and Arabic builds.
 */

const LANGS = ["en", "fr", "ar"] as const;
const dict = translations as unknown as Record<string, Record<string, unknown>>;

test("the dictionary exposes all three languages", () => {
  for (const lang of LANGS) {
    assert.ok(dict[lang], `missing dictionary for ${lang}`);
  }
});

function flatten(value: unknown, prefix = ""): Set<string> {
  if (typeof value === "string") return new Set([prefix]);
  if (typeof value !== "object" || value === null) return new Set();
  const out = new Set<string>();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    for (const nested of flatten(child, path)) out.add(nested);
  }
  return out;
}

test("all three languages define exactly the same keys", () => {
  const enKeys = flatten(dict.en);
  const frKeys = flatten(dict.fr);
  const arKeys = flatten(dict.ar);

  for (const key of enKeys) {
    assert.ok(frKeys.has(key), `fr is missing "${key}"`);
    assert.ok(arKeys.has(key), `ar is missing "${key}"`);
  }
  for (const key of frKeys) {
    assert.ok(enKeys.has(key), `en is missing "${key}" (present only in fr)`);
  }
  for (const key of arKeys) {
    assert.ok(enKeys.has(key), `en is missing "${key}" (present only in ar)`);
  }
});

test("no translation value is blank", () => {
  for (const lang of LANGS) {
    for (const [key, value] of Object.entries(dict[lang])) {
      if (typeof value === "string") {
        assert.ok(value.trim().length > 0, `${lang}.${key} is blank`);
      } else if (typeof value === "object" && value !== null) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          if (typeof v === "string") {
            assert.ok(v.trim().length > 0, `${lang}.${key}.${k} is blank`);
          }
        }
      }
    }
  }
});

test("keys referenced by the UI exist in every language", () => {
  // Every key the pages/components call through t().
  const required = [
    "appName", "tagline", "heroSubtitle", "playGame", "scanMessage",
    "sixRedFlags", "redFlagsDesc", "gameTitle", "gameSubtitle", "swipeLeft",
    "swipeRight", "btnScam", "btnReal", "correct", "incorrect", "explanation",
    "redFlagsFound", "nextMessage", "score", "streak", "gameComplete",
    "finalScore", "moneySaved", "badge", "shareResult", "playAgain", "scanNow",
    "scannerTitle", "scannerSubtitle", "pasteMessage", "scanBtn", "scanning",
    "riskScore", "riskLevel", "low", "medium", "high", "highlightedFlags",
    "flagList", "aiExplanation", "rulesExplanation", "aiBadge", "rulesBadge",
    "noFlags", "safeMessage", "language", "english", "french", "arabic",
    "footerText", "loading", "error", "tryAgain", "clear", "aiScore",
    "aiThinking", "wasScam", "wasLegit", "messagesCount", "badgeScamMaster",
    "badgeSharpEye", "badgeCarefulSender", "badgeLearning", "badgeBeginner",
    "scoreOutOf", "ruleBasedScore", "aiIndependentRead", "awardCategory",
    "aiDisclaimer",
  ];

  for (const key of required) {
    for (const lang of LANGS) {
      assert.ok(key in dict[lang], `${lang} is missing required key "${key}"`);
    }
  }
});

test("nested agreement labels exist in every language", () => {
  const statuses = ["agree", "ai_higher", "ai_lower", "ai_unavailable"];
  for (const lang of LANGS) {
    const agreement = dict[lang].agreement as Record<string, string> | undefined;
    assert.ok(agreement, `${lang} is missing the agreement group`);
    for (const status of statuses) {
      assert.ok(
        typeof agreement[status] === "string" && agreement[status].trim().length > 0,
        `${lang}.agreement.${status} is missing or blank`
      );
    }
  }
});

test("nested red-flag rule labels exist in every language", () => {  const ruleIds = [
    "urgency", "credential_request", "suspicious_link", "prize_claim",
    "upfront_fee", "threat", "impersonation", "unusual_payment",
    "new_number_family", "secrecy", "too_good",
  ];
  for (const lang of LANGS) {
    const rules = dict[lang].rules as Record<string, string> | undefined;
    assert.ok(rules, `${lang} is missing the rules group`);
    for (const id of ruleIds) {
      assert.ok(
        typeof rules[id] === "string" && rules[id].trim().length > 0,
        `${lang}.rules.${id} is missing or blank`
      );
    }
  }
});

test("responsible AI disclosures exist in every language", () => {
  const sections = [
    "title", "intro", "sendTitle", "sendBody", "storeTitle", "storeBody",
    "limitsTitle", "limitsBody", "rulesTitle", "rulesBody", "offlineTitle",
    "offlineBody", "helpTitle", "helpBody",
  ];
  for (const lang of LANGS) {
    const group = dict[lang].responsibleAi as Record<string, string> | undefined;
    assert.ok(group, `${lang} is missing the responsibleAi group`);
    for (const key of sections) {
      assert.ok(
        typeof group[key] === "string" && group[key].trim().length > 0,
        `${lang}.responsibleAi.${key} is missing or blank`
      );
    }
  }
});

test("the AI limitation disclaimer is present in every language", () => {
  for (const lang of LANGS) {
    const value = dict[lang].aiDisclaimer;
    assert.ok(typeof value === "string" && value.trim().length > 0, `${lang}.aiDisclaimer is blank`);
  }
});
