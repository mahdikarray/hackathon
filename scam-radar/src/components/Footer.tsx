"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Shield, Heart, ShieldCheck } from "lucide-react";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/50 bg-surface/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-bold text-lg">{t("appName")}</span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-foreground/60">{t("footerText")}</p>
            <Link
              href="/responsible-ai"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {t("responsibleAi.title")}
            </Link>
          </div>

          <span className="flex items-center gap-1 text-sm text-foreground/50">
            <Heart className="h-4 w-4 text-danger" aria-hidden="true" />
            <span>{t("awardCategory")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
