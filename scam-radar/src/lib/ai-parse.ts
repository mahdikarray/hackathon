export interface AIAssessment {
  ai_score: number;
  ai_flags: string[];
  reasoning: string;
}

/**
 * Models wrap JSON in ```json fences and like to add a sentence of prose around
 * it, so we recover the outermost object before parsing rather than trusting the
 * shape of the response.
 */
function extractJsonBlock(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) return raw.slice(start, end + 1);

  return raw.trim();
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function sanitizeFlags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((flag): flag is string => typeof flag === "string")
    .map((flag) => flag.trim())
    .filter((flag) => flag.length > 0)
    .slice(0, 5);
}

/**
 * Parses an LLM assessment defensively. Returns null when the payload cannot be
 * trusted - a missing reasoning string means we have nothing to show the user, so
 * we let the caller fall back rather than rendering a half-empty panel.
 */
export function parseAIResponse(raw: string): AIAssessment | null {
  if (typeof raw !== "string" || raw.trim().length === 0) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonBlock(raw));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const record = parsed as Record<string, unknown>;
  const reasoning = typeof record.reasoning === "string" ? record.reasoning.trim() : "";
  if (!reasoning) return null;

  return {
    ai_score: clampScore(record.ai_score),
    ai_flags: sanitizeFlags(record.ai_flags),
    reasoning,
  };
}
