import test from "node:test";
import assert from "node:assert/strict";
import { getMessages } from "../src/lib/game-messages";

const LANGS = ["en", "fr", "ar"] as const;
const EXPECTED_COUNT = 20;

const en = getMessages("en");

test("every language ships the expected number of messages", () => {
  for (const lang of LANGS) {
    assert.equal(getMessages(lang).length, EXPECTED_COUNT, `${lang} has the wrong count`);
  }
});

test("an unknown language falls back to English", () => {
  // @ts-expect-error deliberately passing an unsupported language
  assert.deepEqual(getMessages("de"), en);
});

test("message ids are 1..20 in every language", () => {
  const expectedIds = en.map((m) => m.id);
  for (const lang of LANGS) {
    assert.deepEqual(getMessages(lang).map((m) => m.id), expectedIds, `${lang} ids drifted`);
  }
});

test("isScam is identical across languages, so scoring stays fair", () => {
  for (const message of en) {
    for (const lang of LANGS) {
      const translated = getMessages(lang).find((m) => m.id === message.id)!;
      assert.equal(
        translated.isScam,
        message.isScam,
        `message ${message.id} is labelled isScam=${translated.isScam} in ${lang} but ${message.isScam} in en`
      );
    }
  }
});

test("both scam and legitimate messages are represented", () => {
  const scams = en.filter((m) => m.isScam).length;
  assert.ok(scams > 0, "expected some scam messages");
  assert.ok(scams < EXPECTED_COUNT, "expected some legitimate messages");
});

test("every message has non-empty text and explanation in every language", () => {
  for (const lang of LANGS) {
    for (const message of getMessages(lang)) {
      assert.ok(message.text.trim().length > 0, `${lang} message ${message.id} has empty text`);
      assert.ok(
        message.explanation.trim().length > 0,
        `${lang} message ${message.id} has an empty or misspelled explanation field`
      );
    }
  }
});

test("message text is actually translated, not copied from English", () => {
  for (const message of en) {
    const french = getMessages("fr").find((m) => m.id === message.id)!;
    const arabic = getMessages("ar").find((m) => m.id === message.id)!;
    assert.notEqual(french.text, message.text, `french text for ${message.id} is untranslated`);
    assert.notEqual(arabic.text, message.text, `arabic text for ${message.id} is untranslated`);
  }
});

test("explanations are actually translated, not copied from English", () => {
  for (const message of en) {
    const french = getMessages("fr").find((m) => m.id === message.id)!;
    assert.notEqual(
      french.explanation,
      message.explanation,
      `french explanation for ${message.id} is untranslated`
    );
  }
});
