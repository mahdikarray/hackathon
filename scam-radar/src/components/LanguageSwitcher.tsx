"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const languages = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "fr" as const, name: "Français", nativeName: "Français" },
  { code: "ar" as const, name: "Arabic", nativeName: "العربية" },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage, t, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("language")}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          role="listbox"
          aria-label={t("language")}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left flex items-center gap-3
                transition-colors
                ${language === lang.code ? "bg-accent/10 text-accent" : "hover:bg-surface/50"}
              `}
              role="option"
              aria-selected={language === lang.code}
            >
              <span>{lang.nativeName}</span>
              {language === lang.code && (
                <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}