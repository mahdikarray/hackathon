"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Language, type Translations } from "@/lib/i18n-dictionary";

export type { Language } from "@/lib/i18n-dictionary";


interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}



const defaultContext: I18nContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
};

const I18nContext = createContext<I18nContextType>(defaultContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language, mounted]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: Translations | string = translations[language];
    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  const isRTL = language === "ar";

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "rtl" : ""}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
