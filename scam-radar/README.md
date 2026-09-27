# Scam Radar

**Spot scams before they cost you money.**

Scam Radar teaches people to recognise financial fraud and checks suspicious
messages for them. It works as two independent detectors that never overwrite
each other: a deterministic rules engine that runs offline, and a language model
that reads the message on its own. When they disagree, the app says so.

Built for remittance senders and receivers, first-time mobile-money users, and
anyone who has never been taught how fraud works. Available in **English,
French and Arabic**, with full right-to-left support.

---

## The problem

Financial scams do more than steal money. People who get defrauded often stop
trusting digital payments and go back to cash, which reverses financial
inclusion one message at a time.

- **$3.5B** reported lost to impersonation scams worldwide in 2025, and nearly
  **1 in 3** fraud reports were impersonation scams — the most common category
  (US Federal Trade Commission).
- In one eight-week INTERPOL operation across 16 African countries, fraud
  networks targeting mobile money and fraudulent loan apps took **$45M+** from
  **1,247 victims** (Operation Red Card 2.0).

Under-reporting is common, so real losses are higher.

---

## How it works

### Two detectors, deliberately kept separate

| | Rules engine | Language model |
|---|---|---|
| Lives in | `src/lib/rules.ts`, `src/lib/detector.ts` | `app/api/explain/route.ts` (Groq) |
| Method | 11 weighted regex rules, EN/FR/AR | reads the message independently |
| Deterministic | yes, same input always gives same score | no, generative |
| Needs network | no | yes |
| Auditable | you can read every rule | opaque |

The AI never sees the rules-based score or flags. It is given only the raw
message and the chosen language, so its answer is a genuine second opinion
rather than an echo. The two are then compared:

```
|ai_score - rules_score| <= 15  ->  "agree"
ai_score  > rules_score + 15     ->  "ai_higher"
ai_score  < rules_score - 15     ->  "ai_lower"
ai is null                       ->  "ai_unavailable"
```

Showing both, and flagging disagreement, is the point. Averaging them into one
number would hide exactly the case a user needs to look at.

### Risk scoring

```
score = sum(weights of triggered rules)
      + 10  if 3 or more rules triggered
      - 15  if a safe-practice phrase is present
      clamped to 0-100
```

| Level | Range |
|---|---|
| Low | 0–29 |
| Medium | 30–59 |
| High | 60–100 |

### The 11 rules

`urgency` (15) · `credential_request` (20) · `suspicious_link` (18) ·
`prize_claim` (16) · `upfront_fee` (18) · `threat` (17) · `impersonation` (15) ·
`unusual_payment` (16) · `new_number_family` (14) · `secrecy` (12) ·
`too_good` (13)

Each carries English, French and Arabic patterns and returns match offsets, so
the scanner can highlight the exact suspicious phrases in the pasted text.

---

## Features

- **Home** — plain-language explanation of the problem, two calls to action, the
  six most common red flags.
- **Game** — 20 swipeable scenarios (drag or buttons), instant feedback naming
  the flags present, score and streak, shareable result card exported as PNG.
- **Scanner** — paste any message, get a highlighted risk breakdown from the
  rules engine, then an independent AI read that loads asynchronously and never
  blocks the rules result.
- **Three languages, real RTL** — including Arabic game content and Arabic
  detector patterns.
- **Works without the AI** — no key, no network, or provider outage: the rules
  panel still works and the AI panel says it is unavailable.
- **No account, no database, no tracking.** See
  [`/responsible-ai`](src/app/responsible-ai/page.tsx) for the full disclosure.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties for the palette |
| Animation | Framer Motion |
| Icons | lucide-react |
| Share card export | html-to-image |
| AI provider | Groq (`gsk_…`), OpenAI-compatible chat completions |
| Tests | Node built-in `node:test` — no test framework dependency |

---

## Getting started

Requires **Node.js 20+** (developed on 21).

```bash
git clone <your-repo-url>
cd scam-radar
npm install
cp .env.example .env.local     # then add your key, see below
npm run dev
```

Open <http://localhost:3000>.

### Configuration

Only one variable is required, and the app is fully functional without it.

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | no | Enables the AI second opinion. Get a free key at <https://console.groq.com/keys> |
| `NEXT_PUBLIC_APP_URL` | no | Public origin, used for share links |

```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The key is read only in the route handler and is never sent to the browser.
`.env.local` is gitignored; `.env.example` contains placeholders only.

### Model selection

`app/api/explain/route.ts` probes a list of model ids in order and caches the
first one that answers, because model availability varies per API key and ids
get retired. If your key cannot reach the first candidate, the next one is tried
automatically — no code change needed.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Compile the pure logic and run the test suite |
| `npm run eval` | Run the AI evaluation harness (needs the app running) |
| `npm run lint` | ESLint |
| `npm run test:clean` | Remove the `.test-build` output directory |

---

## Testing

```bash
npm test
```

64 tests run on Node's built-in runner, with no test framework added as a
dependency. They compile the pure logic to `.test-build/` and exercise it
directly.

Coverage includes:

- **`detector.test.ts`** — English, French and Arabic detection; the scoring
  formula and its clamps; level thresholds; that every match offset slices back
  to its own phrase (which is what the highlighter relies on); that French
  accented keywords match mid-sentence; that no Arabic pattern uses `\b`, which
  does not work on Arabic script; and that repeated scans of the same text are
  deterministic.
- **`agreement.test.ts`** — every boundary of the ±15 point tolerance.
- **`ai-parse.test.ts`** — code fences, prose around the JSON, missing fields,
  out-of-range scores, malformed flags.
- **`game-messages.test.ts`** — 20 messages per language, and that `isScam`
  matches across translations so the game stays fairly scored.
- **`i18n.test.ts`** — all three languages define exactly the same keys, with no
  blank values.

- **`eval/metrics.ts`** — the scoring maths, and the pass/fail gates
- **`tests/eval-metrics.test.ts`** — confusion-matrix maths, gate behaviour, and
  dataset integrity.

Two real bugs were found by these tests and are now fixed: a stateful
`lastIndex` on the safe-practice regexes that made scores depend on scan order,
and Arabic credential-phishing messages scoring "low".

---

## AI evaluation

Claims about model quality are only worth something if they are measured.
`npm run eval` calls the real `/api/explain` endpoint against a hand-labelled set
of 36 cases — 12 per language, split between scams and legitimate messages, plus
two prompt-injection attempts — and writes [`eval/report.md`](eval/report.md).

```bash
npm run dev            # in one terminal
npm run eval           # in another
npm run eval -- --only en-01,fr-02   # a subset
node .test-build/eval/probe.js fr-08 6   # run one case 6x to check stability
```

Latest run:

| Metric | AI | Rules engine |
| --- | --- | --- |
| Recall on real scams | **100%** (17/17) | 76% (13/17) |
| Precision | **100%** (17/17) | 100% |
| JSON parse rate | 100% | n/a, deterministic |
| Answered in the requested language | 100% | n/a |
| Prompt injections resisted | 100% (2/2) | n/a |
| Latency p50 / p95 | 676ms / 2351ms | 0ms, offline |

Six gates gate the run, and it exits non-zero if any fails: recall ≥ 0.9,
precision ≥ 0.7, accuracy ≥ 0.85, and parse rate, language compliance and
injection resistance all exactly 1.

**The labels are not derived from `detect()`.** They were assigned by hand
before running the model. If the labels came from our own regexes, the harness
would only be measuring whether the AI agrees with the rules engine, which is
the thing it exists to check independently.

### What the harness found

The rules engine misses about one scam in four. Looking at the report, all four
misses matched the right rules but landed just under the 30-point threshold,
because the +10 multi-rule bonus requires three or more rules and a two-rule
match caps out below it:

| Case | Matched | Score |
| --- | --- | --- |
| `en-03` | `credential_request` + `impersonation` | 20 |
| `en-04` | `new_number_family` + `secrecy` | 26 |
| `en-06` | `too_good` only | 13 |
| `fr-04` | `impersonation` + `new_number_family` | 29 |

These are left as-is and documented in the report. Reweighting the rules until
this table looked better would be measuring the wrong thing — the gap is the
reason a second, independent detector is worth running at all.

The harness also caught a real product bug. At `temperature: 0.2` the model
scored one legitimate French appointment reminder anywhere from 5 to 50 across
six identical requests, inventing a "phishing technique" that was not in the
text, and crossing the risk threshold on one run. A scanner that changes its
verdict when you paste the same message twice is worse than useless, so
`temperature` is now `0`; the same six runs return an identical score and
identical reasoning.

---

## Project structure

```
src/
├── app/
│   ├── api/explain/route.ts     # Groq call, model probe cache, response shape
│   ├── game/                    # 20 swipeable scenarios
│   ├── scanner/                 # paste + dual assessment
│   ├── result/                  # score, badge, PNG export
│   ├── responsible-ai/          # data + AI disclosure
│   └── page.tsx                 # home
├── components/                  # Button, Card, Badge, Header, Footer, ...
└── lib/
    ├── rules.ts                 # 11 rules, EN/FR/AR patterns, weights
    ├── detector.ts              # detect(text, lang) -> score, level, matches
    ├── agreement.ts             # rules vs AI comparison
    ├── ai-parse.ts              # defensive LLM response parsing
    ├── i18n-dictionary.ts       # all UI strings, 3 languages
    ├── i18n.tsx                 # provider, persistence, RTL
    └── game-messages.*.json     # 20 scenarios per language
tests/                           # node:test suites
eval/
├── dataset.ts                   # 36 hand-labelled cases
├── metrics.ts                   # scoring maths + quality gates
├── run.ts                       # harness (npm run eval)
├── probe.ts                     # repeat one case to check stability
└── report.md                    # latest results, committed
```

---

## Design notes

**Why the AI is not the verdict.** A language model is confidently wrong in both
directions. The rules engine is deterministic and readable, so it carries the
primary result and the AI is advisory. The app states its own limits rather than
implying certainty.

**Why Arabic patterns avoid `\b`.** JavaScript treats accented characters as
non-word characters, so `\b` silently fails on French text. `rules.ts` uses an
explicit boundary class for French and no word boundaries at all for Arabic,
where the script does not delimit words with spaces.

**Why there is no database.** A fraud-awareness tool that harvests the messages
people paste would be a liability. Everything runs client-side except the AI
call, and nothing is retained.

---

## Live demo

<!-- TODO: replace with your deployed URL before submitting -->
Not yet deployed. To run it locally, follow **Getting started** above. A
`localhost` URL will not work for remote reviewers, so deploy before
submitting:

```bash
npm run build
npx vercel --prod
```

Then set `GROQ_API_KEY` in the Vercel project environment variables.

---

## Licence

MIT. Built for a Financial Inclusion award.
