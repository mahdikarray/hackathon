"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle, Bug } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-500 mb-6">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("errorTitle")}</h1>
          <p className="text-foreground/60 mb-6">{t("errorDesc")}</p>

          <Card variant="elevated" padding="lg">
            <CardContent className="space-y-4 text-left">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
                  <span className="font-semibold">{t("errorDetails")}</span>
                  <span className="text-foreground/50 text-xs">({error.digest?.slice(0, 12) || "unknown"})</span>
                </div>
                <pre className="text-xs text-red-800 bg-red-50 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />}>
                  {t("tryAgain")}
                </Button>
                <Link href="/">
                  <Button variant="secondary" leftIcon={<Home className="h-4 w-4" />}>
                    {t("goHome")}
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-foreground/50 text-center">
                {t("errorReportNote")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}