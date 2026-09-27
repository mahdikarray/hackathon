"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { RotateCcw, Share2, ArrowRight, Check, X, Info, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getMessages, type GameMessage } from "@/lib/game-messages";

interface FeedbackData {
  isCorrect: boolean;
  isScam: boolean;
  explanation: string;
  redFlags: string[];
}

export default function GamePage() {
  const { t, isRTL, language } = useI18n();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState<FeedbackData | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const messages = getMessages(language);
  const currentMessage = messages[currentIndex];
  const isLastMessage = currentIndex === messages.length - 1;
  const progress = ((currentIndex + 1) / messages.length) * 100;

  const handleAnswer = useCallback((answer: boolean) => {
    const isCorrect = answer === currentMessage.isScam;
    const newScore = isCorrect ? score + 10 : score;
    const newStreak = isCorrect ? streak + 1 : 0;

    setScore(newScore);
    setStreak(newStreak);
    setShowFeedback({
      isCorrect,
      isScam: currentMessage.isScam,
      explanation: currentMessage.explanation,
      redFlags: [],
    });
  }, [currentMessage, score, streak]);

  const handleNext = useCallback(() => {
    if (isLastMessage) {
      router.push(`/result?score=${score}&streak=${streak}`);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(null);
      setDragOffset(0);
    }
  }, [isLastMessage, score, streak, router]);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > 100) {
      handleAnswer(dragOffset < 0);
    } else {
      setDragOffset(0);
    }
  };
  const handleDragMove = (x: number) => {
    setDragOffset(Math.max(-200, Math.min(200, x)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleDragMove(e.clientX - e.currentTarget.getBoundingClientRect().left - 150);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleDragMove(e.touches[0].clientX - e.currentTarget.getBoundingClientRect().left - 150);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col p-4 md:p-6">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="success" dot>{t("score")}: {score}</Badge>
              <Badge variant="info" dot>{t("streak")}: {streak}</Badge>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {showFeedback ? (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <FeedbackPanel
                    data={showFeedback}
                    onNext={handleNext}
                    isLast={isLastMessage}
                    t={t}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`card-${currentIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <GameCard
                    message={currentMessage}
                    dragOffset={dragOffset}
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onAnswer={handleAnswer}
                    t={t}
                    isRTL={isRTL}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 px-4">
            <Button
              variant="danger"
              size="lg"
              className="flex-1 sm:flex-none"
              onClick={() => handleAnswer(true)}
              leftIcon={<X className="h-5 w-5" aria-hidden="true" />}
            >
              {t("btnScam")}
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 sm:flex-none"
              onClick={() => handleAnswer(false)}
              rightIcon={<Check className="h-5 w-5" aria-hidden="true" />}
            >
              {t("btnReal")}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface GameCardProps {
  message: GameMessage;
  dragOffset: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onAnswer: (answer: boolean) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

function GameCard({
  message,
  dragOffset,
  isDragging,
  onDragStart,
  onDragEnd,
  onMouseMove,
  onTouchMove,
  onAnswer,
  t,
  isRTL,
}: GameCardProps) {
  const rotate = dragOffset / 200 * 15;
  const opacity = Math.abs(dragOffset) / 200;

  return (
    <Card variant="elevated" padding="lg" className="w-full touch-none">
      <CardContent className="relative">
        <div
          className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none"
          aria-hidden="true"
        >
          <div
            className={`flex items-center gap-2 text-danger font-medium opacity-0 transition-opacity ${isRTL ? "translate-x-4" : "-translate-x-4"}`}
            style={{ opacity: dragOffset < 0 ? opacity : 0 }}
          >
            <X className="h-5 w-5" />
            <span>{t("swipeLeft")}</span>
          </div>
          <div
            className={`flex items-center gap-2 text-accent font-medium opacity-0 transition-opacity ${isRTL ? "-translate-x-4" : "translate-x-4"}`}
            style={{ opacity: dragOffset > 0 ? opacity : 0 }}
          >
            <span>{t("swipeRight")}</span>
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div
          className="relative"
          style={{
            transform: `rotate(${rotate}deg) translateX(${dragOffset}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onMouseMove={onMouseMove}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onTouchMove={onTouchMove}
          role="button"
          tabIndex={0}
          aria-label={t("gameTitle")}
        >
          <div className="card p-6 min-h-[200px] flex items-center justify-center">
            <p className="text-lg leading-relaxed text-center whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border/30">
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => onAnswer(true)}
            leftIcon={<X className="h-5 w-5" aria-hidden="true" />}
          >
            {t("btnScam")}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => onAnswer(false)}
            rightIcon={<Check className="h-5 w-5" aria-hidden="true" />}
          >
            {t("btnReal")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeedbackPanelProps {
  data: FeedbackData;
  onNext: () => void;
  isLast: boolean;
  t: (key: string) => string;
}

function FeedbackPanel({ data, onNext, isLast, t }: FeedbackPanelProps) {
  return (
    <Card variant="elevated" padding="lg">
      <CardContent>
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              data.isCorrect ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"
            }`}
          >
            {data.isCorrect ? (
              <Check className="h-8 w-8" aria-hidden="true" />
            ) : (
              <X className="h-8 w-8" aria-hidden="true" />
            )}
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">{data.isCorrect ? t("correct") : t("incorrect")}</h2>
          <p className="text-foreground/70">
            {data.isScam ? t("wasScam") : t("wasLegit")}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" aria-hidden="true" />
              {t("explanation")}
            </h3>
            <p className="text-foreground/80 leading-relaxed">{data.explanation}</p>
          </div>

          {data.redFlags.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                {t("redFlagsFound")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.redFlags.map((flag, index) => (
                  <Badge key={index} variant="warning" className="text-xs">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={onNext}
          rightIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
        >
          {isLast ? t("gameComplete") : t("nextMessage")}
        </Button>
      </CardContent>
    </Card>
  );
}