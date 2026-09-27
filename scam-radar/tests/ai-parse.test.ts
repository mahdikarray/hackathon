import test from "node:test";
import assert from "node:assert/strict";
import { parseAIResponse } from "../src/lib/ai-parse";

const valid = {
  ai_score: 80,
  ai_flags: ["urgent action", "asks for PIN"],
  reasoning: "This message pressures you to act fast and asks for your PIN.",
};

test("parses a clean payload", () => {
  assert.deepEqual(parseAIResponse(JSON.stringify(valid)), valid);
});

test("strips markdown code fences", () => {
  const fenced = "```json\n" + JSON.stringify(valid) + "\n```";
  assert.deepEqual(parseAIResponse(fenced), valid);
});

test("strips bare code fences without a language tag", () => {
  const fenced = "```\n" + JSON.stringify(valid) + "\n```";
  assert.deepEqual(parseAIResponse(fenced), valid);
});

test("recovers JSON wrapped in conversational prose", () => {
  const chatty = `Sure! Here is my assessment:\n${JSON.stringify(valid)}\nLet me know if you need more.`;
  assert.deepEqual(parseAIResponse(chatty), valid);
});

test("tolerates surrounding whitespace", () => {
  assert.deepEqual(parseAIResponse("   \n" + JSON.stringify(valid) + "\n  "), valid);
});

test("clamps out-of-range scores into 0-100", () => {
  assert.equal(parseAIResponse('{"ai_score":150,"reasoning":"x"}')?.ai_score, 100);
  assert.equal(parseAIResponse('{"ai_score":-40,"reasoning":"x"}')?.ai_score, 0);
});

test("rounds fractional scores", () => {
  assert.equal(parseAIResponse('{"ai_score":78.6,"reasoning":"x"}')?.ai_score, 79);
  assert.equal(parseAIResponse('{"ai_score":78.4,"reasoning":"x"}')?.ai_score, 78);
});

test("defaults a missing or non-numeric score to 0", () => {
  assert.equal(parseAIResponse('{"reasoning":"x"}')?.ai_score, 0);
  assert.equal(parseAIResponse('{"ai_score":"high","reasoning":"x"}')?.ai_score, 0);
});

test("defaults missing or malformed flags to an empty array", () => {
  assert.deepEqual(parseAIResponse('{"ai_score":50,"reasoning":"x"}')?.ai_flags, []);
  assert.deepEqual(parseAIResponse('{"ai_score":50,"ai_flags":"nope","reasoning":"x"}')?.ai_flags, []);
  assert.deepEqual(parseAIResponse('{"ai_score":50,"ai_flags":[1,null,{}],"reasoning":"x"}')?.ai_flags, []);
});

test("drops blank flag entries and caps the list at 5", () => {
  const many = Array.from({ length: 9 }, (_, i) => `"flag ${i}"`).join(",");
  const parsed = parseAIResponse(`{"ai_score":50,"ai_flags":[${many}],"reasoning":"x"}`);
  assert.equal(parsed?.ai_flags.length, 5);

  const withBlanks = parseAIResponse('{"ai_score":50,"ai_flags":["  ","real flag",""],"reasoning":"x"}');
  assert.deepEqual(withBlanks?.ai_flags, ["real flag"]);
});

test("rejects payloads with no usable reasoning", () => {
  assert.equal(parseAIResponse('{"ai_score":50,"ai_flags":["a"]}'), null);
  assert.equal(parseAIResponse('{"ai_score":50,"reasoning":"   "}'), null);
  assert.equal(parseAIResponse('{"ai_score":50,"reasoning":42}'), null);
});

test("rejects structurally invalid input", () => {
  assert.equal(parseAIResponse(""), null);
  assert.equal(parseAIResponse("   "), null);
  assert.equal(parseAIResponse("not json at all"), null);
  assert.equal(parseAIResponse('{"ai_score":50,"reasoning":'), null);
  assert.equal(parseAIResponse("[1,2,3]"), null);
  assert.equal(parseAIResponse("42"), null);
});
