"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 text-red-500 mb-6">
              <span className="text-3xl font-bold">404</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("notFoundTitle")}</h1>
            <p className="text-foreground/60 text-lg">{t("notFoundDesc")}</p>
          </div>

          <Card variant="elevated" padding="lg">
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
                    {t("goHome")}
                  </Button>
                </Link>
                <Link href="/scanner">
                  <Button variant="secondary" leftIcon={<Search className="h-4 w-4" />}>
                    {t("scanMessage")}
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/game" className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-accent hover:underline">
                  <span>{t("playGame")}</span>
                </Link>
                <Link href="/responsible-ai" className="flex-1 inline-flex items-center justify-center gap-2 text-sm text-accent hover:underline">
                  <ShieldCheck className="h-4 w-4" />
                  {t("responsibleAi.title")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}