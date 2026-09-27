"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Bot, Shield, Info, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Textarea } from "@/components/Input";
import { detect, getFlagList, type DetectionResult } from "@/lib/detector";
import { HighlightedText, FlagList, RiskLevelBadge } from "@/components/HighlightedText";

interface DualResponse {
  rules: { score: number; flags: string[] };
  ai: { score: number; flags: string[]; reasoning: string } | null;
  agreement: "agree" | "ai_higher" | "ai_lower" | "ai_unavailable";
  source: "dual" | "fallback";
}

export default function ScannerPage() {
  const { t, isRTL, language } = useI18n();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [dualResult, setDualResult] = useState<DualResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScan = useCallback(async () => {
    if (!message.trim()) return;

    setIsScanning(true);
    setDualResult(null);

    try {
      const detectionResult = detect(message, language);
      setResult(detectionResult);

      const rulesFlags = getFlagList(detectionResult).map(f => f.name);

      setAiLoading(true);
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: message,
          lang: language,
          rules_score: detectionResult.score,
          rules_flags: rulesFlags,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDualResult(data);
      } else {
        throw new Error("API error");
      }
    } catch (error) {
      console.error("Scan error:", error);
      if (result) {
        const rulesFlags = getFlagList(result).map(f => f.name);
        setDualResult({
          rules: { score: result.score, flags: rulesFlags },
          ai: null,
          agreement: "ai_unavailable",
          source: "fallback",
        });
      }
    } finally {
      setIsScanning(false);
      setAiLoading(false);
    }
  }, [message, language]);

  const handleClear = useCallback(() => {
    setMessage("");
    setResult(null);
    setDualResult(null);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const agreementLabels: Record<string, string> = {
    agree: t("agreement.agree"),
    ai_higher: t("agreement.ai_higher"),
    ai_lower: t("agreement.ai_lower"),
    ai_unavailable: t("agreement.ai_unavailable"),
  };

  const agreementColors: Record<string, "success" | "warning" | "info" | "default"> = {
    agree: "success",
    ai_higher: "warning",
    ai_lower: "info",
    ai_unavailable: "default",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">{t("scannerTitle")}</h1>
            <p className="text-foreground/70">{t("scannerSubtitle")}</p>
          </motion.div>

          <Card variant="elevated" padding="lg">
            <CardContent>
              <Textarea
                ref={textareaRef}
                label={t("pasteMessage")}
                placeholder={t("pasteMessage")}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="mb-4"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleScan}
                  disabled={isScanning || !message.trim()}
                  leftIcon={isScanning ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Shield className="h-5 w-5" aria-hidden="true" />}
                >
                  {isScanning ? t("scanning") : t("scanBtn")}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleClear}
                  disabled={!message.trim() && !result}
                >
                  {t("clear")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <AnimatePresence mode="wait">
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResultDisplay
                  result={result}
                  message={message}
                  dualResult={dualResult}
                  aiLoading={aiLoading}
                  t={t}
                  agreementLabels={agreementLabels}
                  agreementColors={agreementColors}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface ResultDisplayProps {
  result: DetectionResult;
  message: string;
  dualResult: DualResponse | null;
  aiLoading: boolean;
  t: (key: string) => string;
  agreementLabels: Record<string, string>;
  agreementColors: Record<string, "success" | "warning" | "info" | "default">;
}

function ResultDisplay({ 
  result, 
  message, 
  dualResult, 
  aiLoading, 
  t, 
  agreementLabels, 
  agreementColors 
}: ResultDisplayProps) {
  const agreement = dualResult?.agreement ?? "ai_unavailable";
  const ai = dualResult?.ai ?? null;

  return (
    <div className="space-y-6">
      {/* Rule-based Score Panel */}
      <Card variant="elevated" padding="lg">
        <CardContent>
          <div className="mb-6">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
              {t("ruleBasedScore")}
            </h2>
            <p className="text-sm text-foreground/60 mb-4">{t("riskScore")}</p>
            <RiskLevelBadge level={result.level} score={result.score} />
          </div>

          <FlagList matches={result.matches} />

          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" aria-hidden="true" />
              {t("highlightedFlags")}
            </h3>
            <div className="card p-4 whitespace-pre-wrap break-words">
              <HighlightedText text={message} matches={result.matches} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Independent Read Panel */}
      <Card variant="outlined" padding="lg">
        <CardContent>
          {aiLoading ? (
            <div className="flex items-start gap-3">
              <Loader2 className="h-6 w-6 text-accent animate-spin mt-1" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">{t("aiIndependentRead")}</p>
                <p className="text-sm text-foreground/60">{t("aiThinking")}</p>
              </div>
            </div>
          ) : ai ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="font-medium text-foreground">{t("aiIndependentRead")}</p>
                </div>
                <Badge variant={agreementColors[agreement]} size="sm" dot>
                  {agreementLabels[agreement]}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="h-12 w-12" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-foreground/10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={283}
                      strokeDashoffset={283 * (1 - ai.score / 100)}
                      strokeLinecap="round"
                      className="text-accent transition-all duration-1000"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                    <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold text-foreground" fill="currentColor">
                      {ai.score}
                    </text>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/60">{t("aiScore")}</p>
                  {ai.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ai.flags.map((flag, i) => (
                        <Badge key={i} variant="outline" size="sm" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/30">
                <p className="text-foreground/80 leading-relaxed text-sm">{ai.reasoning}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-foreground/60">
              <Shield className="h-5 w-5 text-foreground/40" aria-hidden="true" />
              <span>{agreementLabels.ai_unavailable}</span>
            </div>
          )}

          <p className="mt-4 pt-3 border-t border-border/30 text-xs text-foreground/50 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("aiDisclaimer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}