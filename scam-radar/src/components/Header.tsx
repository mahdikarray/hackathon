"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/#how", label: t("navHow") },
    { href: "/#features", label: t("navFeatures") },
    { href: "/#red-flags", label: t("navRedFlags") },
    { href: "/responsible-ai", label: t("navAbout") },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label={t("appName")}
          >
            <span className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-bold text-lg tracking-tight text-foreground">
              {t("appName")}
            </span>
          </Link>

          <nav
            className="hidden lg:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`relative py-2 text-[15px] transition-colors ${
                  isActive(item.href)
                    ? "font-semibold text-foreground after:absolute after:inset-x-0 after:-bottom-[3px] after:h-0.5 after:rounded-full after:bg-accent"
                    : "font-medium text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <LanguageSwitcher compact />
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <Link href="/scanner" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">
              {t("scanMessage")}
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <LanguageSwitcher compact />
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-slate-100 rounded-lg transition-colors"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-surface">
          <nav
            className="container mx-auto py-2 flex flex-col"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`py-3 text-[15px] border-b border-border/60 last:border-0 transition-colors ${
                  isActive(item.href)
                    ? "font-semibold text-foreground"
                    : "font-medium text-foreground/70"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/scanner"
              onClick={() => setOpen(false)}
              className="btn-primary my-3 w-full"
            >
              {t("scanMessage")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
