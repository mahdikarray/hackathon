export type Agreement = "agree" | "ai_higher" | "ai_lower" | "ai_unavailable";

/** Score difference (in points) within which we treat the two engines as agreeing. */
export const AGREEMENT_TOLERANCE = 15;

/**
 * Compares the deterministic rules score against the AI's independent score.
 *
 * A missing AI result is not agreement in any sense - it means we have no second
 * opinion at all, so it gets its own state rather than being folded into "agree".
 */
export function computeAgreement(rulesScore: number, aiScore: number | null): Agreement {
  if (aiScore === null || Number.isNaN(aiScore)) return "ai_unavailable";

  const diff = aiScore - rulesScore;

  if (Math.abs(diff) <= AGREEMENT_TOLERANCE) return "agree";
  return diff > 0 ? "ai_higher" : "ai_lower";
}
