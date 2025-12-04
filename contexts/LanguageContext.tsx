import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "tr";

interface Translations {
  welcome: string;
  tagline: string;
  needHelp: string;
  offerHelp: string;
  activeRequests: string;
  helpedToday: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to METU Help",
    tagline: "Connect with fellow students for instant campus support",
    needHelp: "NEED HELP",
    offerHelp: "OFFER HELP",
    activeRequests: "Active Requests",
    helpedToday: "Helped Today",
  },
  tr: {
    welcome: "ODTU Yardim'a Hosgeldiniz",
    tagline: "Aninda kampus destegi icin diger ogrencilerle baglantiya gecin",
    needHelp: "YARDIM ISTIYORUM",
    offerHelp: "YARDIM EDIYORUM",
    activeRequests: "Aktif Istekler",
    helpedToday: "Bugun Yardim Edildi",
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "tr" : "en"));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
