"use client";

import Link from "next/link";
import { ShieldCheck, Heart, ShieldAlert, Gamepad2, ScanSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  const product = [
    { href: "/game", label: t("playGame"), icon: Gamepad2 },
    { href: "/scanner", label: t("scanMessage"), icon: ScanSearch },
    { href: "/responsible-ai", label: t("responsibleAi.title"), icon: ShieldCheck },
  ];

  const learn = [
    { href: "/#how", label: t("navHow") },
    { href: "/#features", label: t("navFeatures") },
    { href: "/#red-flags", label: t("navRedFlags") },
    { href: "/#why", label: t("whyTitle") },
  ];

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container mx-auto py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-bold text-lg text-foreground">{t("appName")}</span>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed mb-4 max-w-xs">
              {t("footerText")}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 bg-slate-100 border border-border rounded-full px-3 py-1.5">
              <Heart className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
              {t("awardCategory")}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-4">
              {t("footerProduct")}
            </h3>
            <ul className="space-y-2.5">
              {product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-accent transition-colors"
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-4">
              {t("footerLearn")}
            </h3>
            <ul className="space-y-2.5">
              {learn.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-foreground/70 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-4">
              {t("footerTrust")}
            </h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
                <span>{t("trustPrivate")}</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
                <span>{t("trustOffline")}</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
                <span>{t("trustTrilingual")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground/50">
            © {new Date().getFullYear()} {t("appName")}. {t("footerRights")}
          </p>
          <Link
            href="/responsible-ai"
            className="text-xs font-medium text-accent hover:underline"
          >
            {t("responsibleAi.title")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
