"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Shield } from "lucide-react";

export function Header() {
  const { t, isRTL } = useI18n();

  const navItems = [
    { href: "/", label: t("appName") },
    { href: "/game", label: t("playGame") },
    { href: "/scanner", label: t("scanMessage") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" aria-label={t("appName")}>
            <Shield className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="font-bold text-xl text-foreground">{t("appName")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navItems.slice(1).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/game" className="btn-primary hidden sm:inline-flex">
              {t("playGame")}
            </Link>
            <Link href="/scanner" className="btn-primary hidden sm:inline-flex">
              {t("scanMessage")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}