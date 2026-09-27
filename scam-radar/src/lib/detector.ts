import { RULES, SAFE_PRACTICE_PATTERNS, type Language, type Rule } from "./rules";

export interface Match {
  phrase: string;
  start: number;
  end: number;
  ruleId: string;
  ruleName: string;
  weight: number;
}

export interface DetectionResult {
  score: number;
  level: "low" | "medium" | "high";
  matches: Match[];
  triggeredRuleIds: string[];
}

function findMatches(text: string, rule: Rule, lang: Language): Match[] {
  const matches: Match[] = [];
  const patterns = rule.patterns[lang];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        phrase: match[0],
        start: match.index,
        end: match.index + match[0].length,
        ruleId: rule.id,
        ruleName: rule.name,
        weight: rule.weight,
      });
      if (!pattern.global) break;
    }
  }

  return matches;
}

function hasSafePractice(text: string, lang: Language): boolean {
  const patterns = SAFE_PRACTICE_PATTERNS[lang];
  for (const pattern of patterns) {
    // Rebuild the regex per call: these are module-level /g instances, and .test()
    // on a global regex advances lastIndex, which would make the penalty apply
    // intermittently across repeated scans.
    if (new RegExp(pattern.source, pattern.flags).test(text)) return true;
  }
  return false;
}

export function detect(text: string, lang: Language = "en"): DetectionResult {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return {
      score: 0,
      level: "low",
      matches: [],
      triggeredRuleIds: [],
    };
  }

  const allMatches: Match[] = [];
  const triggeredRuleIds = new Set<string>();

  for (const rule of RULES) {
    const matches = findMatches(normalizedText, rule, lang);
    if (matches.length > 0) {
      triggeredRuleIds.add(rule.id);
      allMatches.push(...matches);
    }
  }

  const uniqueTriggeredRules = Array.from(triggeredRuleIds);
  const totalWeight = uniqueTriggeredRules.reduce((sum, ruleId) => {
    const rule = RULES.find(r => r.id === ruleId);
    return sum + (rule?.weight ?? 0);
  }, 0);

  let score = totalWeight;

  if (uniqueTriggeredRules.length >= 3) {
    score += 10;
  }

  if (hasSafePractice(normalizedText, lang)) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  let level: "low" | "medium" | "high";
  if (score <= 29) level = "low";
  else if (score <= 59) level = "medium";
  else level = "high";

  allMatches.sort((a, b) => a.start - b.start);

  return {
    score,
    level,
    matches: allMatches,
    triggeredRuleIds: uniqueTriggeredRules,
  };
}

export function getFlagList(result: DetectionResult): Array<{ id: string; name: string; weight: number }> {
  return result.triggeredRuleIds.map(id => {
    const rule = RULES.find(r => r.id === id);
    return {
      id: rule!.id,
      name: rule!.name,
      weight: rule!.weight,
    };
  });
}

export function highlightText(text: string, matches: Match[]): Array<{ text: string; highlighted: boolean; ruleId?: string }> {
  if (matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments: Array<{ text: string; highlighted: boolean; ruleId?: string }> = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.start), highlighted: false });
    }
    segments.push({ text: match.phrase, highlighted: true, ruleId: match.ruleId });
    lastIndex = match.end;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false });
  }

  return segments;
}