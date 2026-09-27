"use client";

import { Match } from "@/lib/detector";
import { useI18n } from "@/lib/i18n";
import { Badge } from "./Badge";

interface HighlightedTextProps {
  text: string;
  matches: Match[];
  className?: string;
}

export function HighlightedText({ text, matches, className = "" }: HighlightedTextProps) {
  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const segments: Array<{ text: string; highlighted: boolean; ruleId?: string }> = [];
  let lastIndex = 0;

  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

  for (const match of sortedMatches) {
    if (match.start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.start), highlighted: false });
    }
    segments.push({ text: match.phrase, highlighted: true, ruleId: match.ruleId });
    lastIndex = match.end;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false });
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={segment.highlighted
            ? "bg-warning/20 text-warning border-b-2 border-warning font-medium rounded px-0.5"
            : ""}
        >
          {segment.text}
        </span>
      ))}
    </span>
  );
}

interface FlagListProps {
  matches: Match[];
  className?: string;
}

export function FlagList({ matches, className = "" }: FlagListProps) {
  if (matches.length === 0) {
    return null;
  }

  const uniqueFlags = Array.from(
    new Map(matches.map(m => [m.ruleId, { name: m.ruleName, weight: m.weight }])).values()
  );

  return (
    <div className={className}>
      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Detected Flags
      </h4>
      <div className="flex flex-wrap gap-2">
        {uniqueFlags.map((flag, index) => (
          <span
            key={flag.name}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-xl text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
            {flag.name}
            <span className="text-warning/60 text-xs font-normal">(+{flag.weight})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface RiskLevelBadgeProps {
  level: "low" | "medium" | "high";
  score: number;
  className?: string;
}

/**
 * Tailwind v4 only generates classes it can see as complete literals in source,
 * so these are written out in full rather than interpolated from a colour name.
 */
const RISK_STYLES = {
  low: { track: "text-accent/20", arc: "text-accent", variant: "success" as const },
  medium: { track: "text-warning/20", arc: "text-warning", variant: "warning" as const },
  high: { track: "text-danger/20", arc: "text-danger", variant: "danger" as const },
};

export function RiskLevelBadge({ level, score, className = "" }: RiskLevelBadgeProps) {
  const { t } = useI18n();
  const style = RISK_STYLES[level];
  const label = t(level);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <svg className="h-16 w-16" viewBox="0 0 100 100" role="img" aria-label={`${t("riskScore")}: ${score}/100`}>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={style.track}
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={283}
            strokeDashoffset={283 * (1 - score / 100)}
            strokeLinecap="round"
            className={`${style.arc} transition-all duration-1000`}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            fill="currentColor"
          >
            {score}
          </text>
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-foreground">{label}</div>
        <div className="text-sm text-foreground/60">{t("riskLevel")}</div>
        <div className="mt-2">
          <Badge variant={style.variant} dot size="sm">
            {label}
          </Badge>
        </div>
      </div>
    </div>
  );
}