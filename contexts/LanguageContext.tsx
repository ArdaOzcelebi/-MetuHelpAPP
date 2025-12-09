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
  verified: string;

  // Auth Screens
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: string;
  signIn: string;
  signUp: string;
  welcomeBack: string;
  signInToContinue: string;
  createAccount: string;
  joinMetuHelp: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  onlyMetuEmail: string;
  passwordRequirements: string;
  registrationSuccess: string;
  checkEmailVerification: string;
  ok: string;
  verifyEmail: string;
  verificationEmailSent: string;
  resendVerification: string;
  backToLogin: string;
  emailNotVerified: string;
  emailSent: string;
  verificationEmailResent: string;
  pleaseFieldAll: string;
  passwordsDoNotMatch: string;
  enterEmailAndPassword: string;
  error: string;
  failedToLogOut: string;

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
    welcome: "Welcome to METU Help!",
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
    verified: "Verified",

    // Auth Screens
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    rememberMe: "Remember Me",
    signIn: "Sign In",
    signUp: "Sign Up",
    welcomeBack: "Welcome Back",
    signInToContinue: "Sign in to continue",
    createAccount: "Create Account",
    joinMetuHelp: "Join METU Help community",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    onlyMetuEmail: "Only @metu.edu.tr emails are allowed",
    passwordRequirements: "At least 8 characters with 1 digit",
    registrationSuccess: "Registration Successful",
    checkEmailVerification: "A verification email has been sent to your email address. Please verify your email before logging in.",
    ok: "OK",
    verifyEmail: "Verify Your Email",
    verificationEmailSent: "We've sent a verification email to your address. Please check your inbox and click the verification link.",
    resendVerification: "Resend Verification Email",
    backToLogin: "Back to Login",
    emailNotVerified: "Email Not Verified",
    emailSent: "Email Sent",
    verificationEmailResent: "Verification email has been resent. Please check your inbox.",
    pleaseFieldAll: "Please fill in all fields",
    passwordsDoNotMatch: "Passwords do not match",
    enterEmailAndPassword: "Please enter both email and password",
    error: "Error",
    failedToLogOut: "Failed to log out",

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
    welcome: "ODTÜ Yardım'a Hoş geldiniz!",
    tagline: "Anında kampüs desteği için diğer öğrencilerle bağlantıya geçin",
    needHelp: "YARDIM İSTE",
    offerHelp: "YARDIM ET",
    activeRequests: "Aktif İstekler",
    helpedToday: "Bugün Yardım Edilen",

    // Categories
    all: "Tümü",
    medical: "Sağlık",
    academic: "Akademik",
    transport: "Ulaşım",
    other: "Diğer",

    // Request Screen
    iCanHelp: "Yardım Edebilirim",
    urgent: "Acil",

    // Q&A Screen
    recent: "Son",
    unanswered: "Cevaplanmamış",
    popular: "Popüler",
    searchQuestions: "Soru ara...",
    responses: "cevap",
    response: "cevap",
    noQuestionsFound: "Soru bulunamadı",
    beFirstToAsk: "İlk soruyu sor!",

    // Categories for Q&A
    classes: "Dersler",
    professors: "Hocalar",
    campusLife: "Kampüs Yaşamı",

    // Browse Screen
    needs: "İhtiyaçlar",
    questions: "Sorular",
    search: "Ara...",

    // Profile Screen
    notifications: "Bildirimler",
    pushNotifications: "Anlık Bildirimler",
    emailUpdates: "E-posta Bildirimleri",
    about: "Hakkında",
    aboutApp: "METU Help Hakkında",
    privacyPolicy: "Gizlilik Politikasi",
    termsOfService: "Kullanım Şartları",
    logOut: "Çıkış Yap",
    logOutConfirm: "Çıkış yapmak istediğinizden emin misiniz?",
    cancel: "İptal",
    loggedOut: "Çıkış Yapıldı",
    loggedOutMessage: "Başarıyla çıkış yaptınız.",
    requestsPosted: "Gönderilen İstekler",
    helpGiven: "Verilen Yardım",
    verified: "Doğrulandı",

    // Auth Screens
    email: "E-posta",
    password: "Şifre",
    confirmPassword: "Şifreyi Onayla",
    rememberMe: "Beni Hatırla",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    welcomeBack: "Tekrar Hoş Geldiniz",
    signInToContinue: "Devam etmek için giriş yapın",
    createAccount: "Hesap Oluştur",
    joinMetuHelp: "METU Help topluluğuna katıl",
    dontHaveAccount: "Hesabınız yok mu?",
    alreadyHaveAccount: "Zaten hesabınız var mı?",
    onlyMetuEmail: "Sadece @metu.edu.tr e-postaları kabul edilir",
    passwordRequirements: "En az 8 karakter ve 1 rakam",
    registrationSuccess: "Kayıt Başarılı",
    checkEmailVerification: "E-posta adresinize bir doğrulama e-postası gönderildi. Giriş yapmadan önce lütfen e-postanızı doğrulayın.",
    ok: "Tamam",
    verifyEmail: "E-postanızı Doğrulayın",
    verificationEmailSent: "Adresinize bir doğrulama e-postası gönderdik. Lütfen gelen kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.",
    resendVerification: "Doğrulama E-postası Tekrar Gönder",
    backToLogin: "Giriş Sayfasına Dön",
    emailNotVerified: "E-posta Doğrulanmadı",
    emailSent: "E-posta Gönderildi",
    verificationEmailResent: "Doğrulama e-postası yeniden gönderildi. Lütfen gelen kutunuzu kontrol edin.",
    pleaseFieldAll: "Lütfen tüm alanları doldurun",
    passwordsDoNotMatch: "Şifreler eşleşmiyor",
    enterEmailAndPassword: "Lütfen e-posta ve şifrenizi girin",
    error: "Hata",
    failedToLogOut: "Çıkış yapılamadı",

    // Navigation
    home: "Ana Sayfa",
    browse: "Keşfet",
    profile: "Profil",
    findHelp: "Yardım Bul",
    campusQA: "Kampus S&C",
    requestDetails: "İstek Detayları",
    postNeed: "İhtiyaç Paylaş",
    questionDetails: "Soru Detayları",
    askQuestion: "Soru Sor",
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
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
