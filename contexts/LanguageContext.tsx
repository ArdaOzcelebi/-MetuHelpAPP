import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "tr";

interface Translations {
  // Home Screen
  welcome: string;
  tagline: string;
  needHelp: string;
  offerHelp: string;
  activeRequests: string;
  helpedToday: string;

  // Categories
  all: string;
  medical: string;
  academic: string;
  transport: string;
  other: string;

  // Request Screen
  iCanHelp: string;
  urgent: string;

  // Q&A Screen
  recent: string;
  unanswered: string;
  popular: string;
  searchQuestions: string;
  responses: string;
  response: string;
  noQuestionsFound: string;
  beFirstToAsk: string;

  // Categories for Q&A
  classes: string;
  professors: string;
  campusLife: string;

  // Browse Screen
  needs: string;
  questions: string;
  search: string;

  // Profile Screen
  notifications: string;
  pushNotifications: string;
  emailUpdates: string;
  about: string;
  aboutApp: string;
  privacyPolicy: string;
  termsOfService: string;
  logOut: string;
  logOutConfirm: string;
  cancel: string;
  loggedOut: string;
  loggedOutMessage: string;
  requestsPosted: string;
  helpGiven: string;

  // Navigation
  home: string;
  browse: string;
  profile: string;
  findHelp: string;
  campusQA: string;
  requestDetails: string;
  postNeed: string;
  questionDetails: string;
  askQuestion: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Home Screen
    welcome: "Welcome to METU Help",
    tagline: "Connect with fellow students for instant campus support",
    needHelp: "NEED HELP",
    offerHelp: "OFFER HELP",
    activeRequests: "Active Requests",
    helpedToday: "Helped Today",

    // Categories
    all: "All",
    medical: "Medical",
    academic: "Academic",
    transport: "Transport",
    other: "Other",

    // Request Screen
    iCanHelp: "I Can Help",
    urgent: "Urgent",

    // Q&A Screen
    recent: "Recent",
    unanswered: "Unanswered",
    popular: "Popular",
    searchQuestions: "Search questions...",
    responses: "responses",
    response: "response",
    noQuestionsFound: "No questions found",
    beFirstToAsk: "Be the first to ask!",

    // Categories for Q&A
    classes: "Classes",
    professors: "Professors",
    campusLife: "Campus Life",

    // Browse Screen
    needs: "Needs",
    questions: "Questions",
    search: "Search...",

    // Profile Screen
    notifications: "Notifications",
    pushNotifications: "Push Notifications",
    emailUpdates: "Email Updates",
    about: "About",
    aboutApp: "About METU Help",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    logOut: "Log Out",
    logOutConfirm: "Are you sure you want to log out?",
    cancel: "Cancel",
    loggedOut: "Logged Out",
    loggedOutMessage: "You have been logged out successfully.",
    requestsPosted: "Requests Posted",
    helpGiven: "Help Given",

    // Navigation
    home: "Home",
    browse: "Browse",
    profile: "Profile",
    findHelp: "Find Help",
    campusQA: "Campus Q&A",
    requestDetails: "Request Details",
    postNeed: "Post a Need",
    questionDetails: "Question Details",
    askQuestion: "Ask a Question",
  },
  tr: {
    // Home Screen
    welcome: "ODTU Yardim'a Hosgeldiniz",
    tagline: "Aninda kampus destegi icin diger ogrencilerle baglantiya gecin",
    needHelp: "YARDIM ISTIYORUM",
    offerHelp: "YARDIM EDIYORUM",
    activeRequests: "Aktif Istekler",
    helpedToday: "Bugun Yardim Edildi",

    // Categories
    all: "Tumu",
    medical: "Saglik",
    academic: "Akademik",
    transport: "Ulasim",
    other: "Diger",

    // Request Screen
    iCanHelp: "Yardim Edebilirim",
    urgent: "Acil",

    // Q&A Screen
    recent: "Son",
    unanswered: "Cevaplanmamis",
    popular: "Populer",
    searchQuestions: "Soru ara...",
    responses: "cevap",
    response: "cevap",
    noQuestionsFound: "Soru bulunamadi",
    beFirstToAsk: "Ilk soruyu sor!",

    // Categories for Q&A
    classes: "Dersler",
    professors: "Hocalar",
    campusLife: "Kampus Yasami",

    // Browse Screen
    needs: "Ihtiyaclar",
    questions: "Sorular",
    search: "Ara...",

    // Profile Screen
    notifications: "Bildirimler",
    pushNotifications: "Anlik Bildirimler",
    emailUpdates: "E-posta Bildirimleri",
    about: "Hakkinda",
    aboutApp: "ODTU Yardim Hakkinda",
    privacyPolicy: "Gizlilik Politikasi",
    termsOfService: "Kullanim Sartlari",
    logOut: "Cikis Yap",
    logOutConfirm: "Cikis yapmak istediginizden emin misiniz?",
    cancel: "Iptal",
    loggedOut: "Cikis Yapildi",
    loggedOutMessage: "Basariyla cikis yaptiniz.",
    requestsPosted: "Gonderilen Istekler",
    helpGiven: "Verilen Yardim",

    // Navigation
    home: "Ana Sayfa",
    browse: "Kesfet",
    profile: "Profil",
    findHelp: "Yardim Bul",
    campusQA: "Kampus S&C",
    requestDetails: "Istek Detaylari",
    postNeed: "Ihtiyac Paylas",
    questionDetails: "Soru Detaylari",
    askQuestion: "Soru Sor",
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
