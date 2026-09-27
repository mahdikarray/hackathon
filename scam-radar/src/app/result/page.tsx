"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Share2, Download, Shield, Trophy, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { toPng } from "html-to-image";

function ResultContent() {
  const { t, isRTL } = useI18n();
  const searchParams = useSearchParams();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const score = parseInt(searchParams.get("score") || "0", 10);
  const streak = parseInt(searchParams.get("streak") || "0", 10);
  const moneySaved = score * 10;

  const getBadge = (score: number) => {
    if (score >= 180) return { labelKey: "badgeScamMaster", icon: Trophy, color: "warning" as const };
    if (score >= 140) return { labelKey: "badgeSharpEye", icon: Shield, color: "success" as const };
    if (score >= 100) return { labelKey: "badgeCarefulSender", icon: CheckCircle, color: "info" as const };
    if (score >= 60) return { labelKey: "badgeLearning", icon: Shield, color: "default" as const };
    return { labelKey: "badgeBeginner", icon: Shield, color: "default" as const };
  };

  const badge = getBadge(score);

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsGenerating(true);
    setShareError(null);

    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0B0F14",
        width: 1080,
        height: 1080,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "scam-radar-score.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Scam Radar Score", text: `I scored ${score} on Scam Radar!` });
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "scam-radar-score.png";
        link.click();
      }
    } catch (error) {
      setShareError("Failed to generate image. Try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0B0F14",
        width: 1080,
        height: 1080,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "scam-radar-score.png";
      link.click();
    } catch (error) {
      setShareError("Failed to download image.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 text-accent mb-6"
              >
                <badge.icon className="h-10 w-10" aria-hidden="true" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-2">{t("gameComplete")}</h1>
              <p className="text-foreground/70">{t("finalScore")}</p>
            </div>

            <div ref={shareCardRef} className="relative">
              <Card variant="elevated" padding="lg" className="relative overflow-hidden">
                <CardContent className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-accent mb-2">{score}</div>
                    <Badge variant={badge.color} className="text-base px-4 py-2" dot>
                      {t(badge.labelKey)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="card p-4 text-center">
                      <DollarSign className="h-6 w-6 text-accent mx-auto mb-2" aria-hidden="true" />
                      <div className="text-2xl font-bold text-foreground">${moneySaved}</div>
                      <div className="text-xs text-foreground/60">{t("moneySaved")}</div>
                    </div>
                    <div className="card p-4 text-center">
                      <Trophy className="h-6 w-6 text-warning mx-auto mb-2" aria-hidden="true" />
                      <div className="text-2xl font-bold text-foreground">{streak}</div>
                      <div className="text-xs text-foreground/60">{t("streak")}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="text-xs">
                      {t("messagesCount")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t("score")}: {score}/200
                    </Badge>
                  </div>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" aria-hidden="true" />
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleShare}
                disabled={isGenerating}
                leftIcon={isGenerating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
              >
                {isGenerating ? t("loading") : t("shareResult")}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleDownload}
                disabled={isGenerating}
                leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}
              >
                {t("shareResult")}
              </Button>
            </div>

            {shareError && (
              <p className="text-center text-danger text-sm" role="alert">{shareError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/game">
                <Button variant="primary" size="lg" className="w-full sm:w-auto" leftIcon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}>
                  {t("playAgain")}
                </Button>
              </Link>
              <Link href="/scanner">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<Shield className="h-5 w-5" aria-hidden="true" />}>
                  {t("scanNow")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-accent animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-foreground/70">Loading results...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultContent />
    </Suspense>
  );
}