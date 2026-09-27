"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const languages = [
  { code: "en" as const, nativeName: "English", short: "EN" },
  { code: "fr" as const, nativeName: "Français", short: "FR" },
  { code: "ar" as const, nativeName: "العربية", short: "عر" },
] as const;

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          compact
            ? "flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
            : "btn-secondary gap-2"
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("language")}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span>{compact ? currentLang.short : currentLang.nativeName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 top-full mt-2 w-44 bg-surface border border-border rounded-xl shadow-lg shadow-slate-200 overflow-hidden z-50 py-1"
              role="listbox"
              aria-label={t("language")}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between gap-2 transition-colors ${
                    language === lang.code
                      ? "font-semibold text-accent bg-accent/5"
                      : "text-foreground/70 hover:bg-slate-100"
                  }`}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
