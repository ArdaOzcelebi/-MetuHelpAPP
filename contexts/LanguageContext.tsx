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
  urgentNeeds: string;
  requestHelp: string;
  helpOthers: string;
  qAndAForum: string;
  qAndAForumDescription: string;
  activeRequestsOnCampus: string;

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
  answers: string;
  answer: string;
  postAnswer: string;
  postQuestion: string;
  writeAnswer: string;
  acceptAnswer: string;
  acceptedAnswer: string;
  editQuestion: string;
  deleteQuestion: string;
  editAnswer: string;
  deleteAnswer: string;
  questionPosted: string;
  questionPostedMessage: string;
  answerPosted: string;
  answerAccepted: string;
  failedToPostQuestion: string;
  failedToPostAnswer: string;
  failedToVote: string;
  noAnswersYet: string;
  beFirstToAnswer: string;
  tags: string;
  addTags: string;
  tagsOptional: string;
  yourQuestion: string;
  questionTitle: string;
  questionBody: string;
  questionTitlePlaceholder: string;
  questionBodyPlaceholder: string;
  tipsForGoodQuestions: string;
  beSpecific: string;
  chooseRightCategory: string;
  checkIfAskedBefore: string;
  loadingQuestions: string;
  loadingQuestion: string;
  deleteQuestionConfirm: string;
  deleteQuestionConfirmMessage: string;
  questionDeleted: string;
  questionDeletedMessage: string;
  failedToDeleteQuestion: string;
  deleteRequestConfirm: string;
  deleteRequestConfirmMessage: string;
  requestDeleted: string;
  requestDeletedMessage: string;
  failedToDeleteRequest: string;
  delete: string;

  // Categories for Q&A
  classes: string;
  professors: string;
  campusLife: string;

  // Browse Screen
  needs: string;
  questions: string;
  search: string;
  noActiveRequests: string;
  noRequestsFound: string;

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
  questionsAsked: string;
  myActivity: string;
  recentActivity: string;
  noRecentActivity: string;
  viewAll: string;
  accountInfo: string;
  memberSince: string;
  settings: string;

  // Auth
  welcomeBack: string;
  signInToContinue: string;
  createAccount: string;
  joinMetuCommunity: string;
  email: string;
  metuEmail: string;
  password: string;
  confirmPassword: string;
  rememberMe: string;
  signIn: string;
  signUp: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  onlyMetuEmailsAllowed: string;
  passwordRequirements: string;
  passwordsDontMatch: string;
  loginFailed: string;
  registrationFailed: string;
  registrationSuccessful: string;
  verificationEmailSent: string;
  verificationEmailSentMessage: string;
  emailNotVerified: string;
  emailNotVerifiedMessage: string;
  resendVerification: string;
  success: string;
  error: string;
  failedToSendVerification: string;
  ok: string;
  logoutFailed: string;
  emailVerified: string;
  forgotPassword: string;
  resetPassword: string;
  enterEmailForReset: string;
  sendResetLink: string;
  passwordResetEmailSent: string;
  passwordResetEmailSentMessage: string;
  invalidEmail: string;
  emailRequired: string;
  verifyYourEmail: string;
  goToLogin: string;
  checkYourInbox: string;

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

  // Post Need Form
  whatDoYouNeed: string;
  itemNamePlaceholder: string;
  category: string;
  location: string;
  additionalDetails: string;
  additionalDetailsPlaceholder: string;
  markAsUrgent: string;
  urgentHint: string;
  postRequest: string;
  isReturnNeeded: string;
  returnNeededHint: string;
  postAnonymously: string;
  anonymousHint: string;
  requestPosted: string;
  requestPostedMessage: string;
  mustBeLoggedIn: string;
  failedToPostRequest: string;
  posting: string;
  title: string;
  pleaseCompleteRequired: string;

  // Chat
  chat: string;
  typeMessage: string;
  send: string;
  finalizeRequest: string;
  finalizeConfirm: string;
  finalizeConfirmMessage: string;
  requestFinalized: string;
  requestFinalizedMessage: string;
  acceptRequest: string;
  acceptConfirm: string;
  acceptConfirmMessage: string;
  requestAccepted: string;
  requestAcceptedMessage: string;
  cannotAcceptOwnRequest: string;
  requestAlreadyAccepted: string;
  failedToAcceptRequest: string;
  failedToSendMessage: string;
  failedToFinalizeRequest: string;
  accepting: string;
  finalizing: string;
  noMessages: string;
  startConversation: string;
  acceptedBy: string;
  requestFinalizedStatus: string;

  // Status
  statusOpen: string;
  statusAccepted: string;
  statusFinalized: string;
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
    urgentNeeds: "URGENT NEEDS",
    requestHelp: "Request Help",
    helpOthers: "Help Others!",
    qAndAForum: "Q&A Forum",
    qAndAForumDescription:
      "Ask questions, share solutions, and engage with the METU community",
    activeRequestsOnCampus: "Active Requests on Campus",

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
    answers: "answers",
    answer: "answer",
    postAnswer: "Post Answer",
    postQuestion: "Post Question",
    writeAnswer: "Write your answer...",
    acceptAnswer: "Accept Answer",
    acceptedAnswer: "Accepted Answer",
    editQuestion: "Edit Question",
    deleteQuestion: "Delete Question",
    editAnswer: "Edit Answer",
    deleteAnswer: "Delete Answer",
    questionPosted: "Question Posted!",
    questionPostedMessage: "Your question has been posted successfully.",
    answerPosted: "Answer Posted!",
    answerAccepted: "Answer Accepted!",
    failedToPostQuestion: "Failed to post question",
    failedToPostAnswer: "Failed to post answer",
    failedToVote: "Failed to record vote",
    noAnswersYet: "No answers yet",
    beFirstToAnswer: "Be the first to answer!",
    tags: "Tags",
    addTags: "Add tags (optional)",
    tagsOptional: "Tags help others find your question",
    yourQuestion: "Your Question",
    questionTitle: "Question Title",
    questionBody: "Additional Details (Optional)",
    questionTitlePlaceholder: "e.g., Best study spots on campus?",
    questionBodyPlaceholder:
      "Provide more context to help others understand your question...",
    tipsForGoodQuestions: "Tips for good questions",
    beSpecific: "Be specific and clear",
    chooseRightCategory: "Choose the right category",
    checkIfAskedBefore: "Check if someone already asked",
    loadingQuestions: "Loading questions...",
    loadingQuestion: "Loading question...",
    deleteQuestionConfirm: "Delete Question?",
    deleteQuestionConfirmMessage:
      "Are you sure you want to delete this question? This action cannot be undone.",
    questionDeleted: "Question Deleted",
    questionDeletedMessage: "Your question has been deleted successfully.",
    failedToDeleteQuestion: "Failed to delete question",
    deleteRequestConfirm: "Delete Request?",
    deleteRequestConfirmMessage:
      "Are you sure you want to delete this request? This action cannot be undone.",
    requestDeleted: "Request Deleted",
    requestDeletedMessage: "Your request has been deleted successfully.",
    failedToDeleteRequest: "Failed to delete request",
    delete: "Delete",

    // Categories for Q&A
    classes: "Classes",
    professors: "Professors",
    campusLife: "Campus Life",

    // Browse Screen
    needs: "Needs",
    questions: "Questions",
    search: "Search...",
    noActiveRequests: "No active requests. Be the first to post!",
    noRequestsFound: "No requests found",

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
    questionsAsked: "Questions Asked",
    myActivity: "My Activity",
    recentActivity: "Recent Activity",
    noRecentActivity: "No recent activity",
    viewAll: "View All",
    accountInfo: "Account Information",
    memberSince: "Member since",
    settings: "Settings",

    // Auth
    welcomeBack: "Welcome Back",
    signInToContinue: "Sign in to continue helping the METU community",
    createAccount: "Create Account",
    joinMetuCommunity: "Join the METU Help community",
    email: "Email",
    metuEmail: "METU Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    rememberMe: "Remember Me",
    signIn: "Sign In",
    signUp: "Sign Up",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    emailPlaceholder: "your.email@metu.edu.tr",
    passwordPlaceholder: "Enter your password",
    confirmPasswordPlaceholder: "Confirm your password",
    onlyMetuEmailsAllowed: "Only @metu.edu.tr email addresses are allowed",
    passwordRequirements: "At least 8 characters with 1 digit",
    passwordsDontMatch: "Passwords don't match",
    loginFailed: "Failed to sign in",
    registrationFailed: "Failed to create account",
    registrationSuccessful: "Registration Successful!",
    verificationEmailSent: "Verification Email Sent",
    verificationEmailSentMessage:
      "Please check your email and click the verification link to complete your registration.",
    emailNotVerified: "Email Not Verified",
    emailNotVerifiedMessage:
      "Please verify your email address before signing in. Check your inbox for the verification link.",
    resendVerification: "Resend Verification Email",
    success: "Success",
    error: "Error",
    failedToSendVerification: "Failed to send verification email",
    ok: "OK",
    logoutFailed: "Failed to log out",
    emailVerified: "Verified",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    enterEmailForReset:
      "Enter your email address to receive a password reset link",
    sendResetLink: "Send Reset Link",
    passwordResetEmailSent: "Password reset email sent!",
    passwordResetEmailSentMessage:
      "Please check your inbox for instructions to reset your password.",
    invalidEmail: "Invalid email format",
    emailRequired: "Email is required",
    verifyYourEmail: "Verify Your Email",
    goToLogin: "Go to Login",
    checkYourInbox:
      "We have sent a verification link to your @metu.edu.tr address.\n\nPlease check your inbox (and spam) and verify your account to unlock access.",

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

    // Post Need Form
    whatDoYouNeed: "What do you need?",
    itemNamePlaceholder: "e.g., Need 1 Bandage",
    category: "Category",
    location: "Location",
    additionalDetails: "Additional Details (Optional)",
    additionalDetailsPlaceholder: "Any extra info that might help...",
    markAsUrgent: "Mark as Urgent",
    urgentHint: "Use only for time-sensitive requests",
    postRequest: "Post Request",
    isReturnNeeded: "Item needs to be returned",
    returnNeededHint: "Check this if you need to return the item",
    postAnonymously: "Post Anonymously",
    anonymousHint: "Your name will be hidden from other users",
    requestPosted: "Request Posted!",
    requestPostedMessage:
      "Your request has been posted. Fellow students will be notified.",
    mustBeLoggedIn: "You must be logged in to post a request.",
    failedToPostRequest: "Failed to post request. Please try again.",
    posting: "Posting...",
    title: "Title",
    pleaseCompleteRequired:
      "Please enter a title, select a category, and select a location before posting.",

    // Chat
    chat: "Chat",
    typeMessage: "Type a message...",
    send: "Send",
    finalizeRequest: "Finalize Request",
    finalizeConfirm: "Finalize Request?",
    finalizeConfirmMessage:
      "Are you sure you want to finalize this request? This will close the chat and mark the request as completed.",
    requestFinalized: "Request Finalized",
    requestFinalizedMessage:
      "The request has been finalized successfully. Thank you for helping!",
    acceptRequest: "Accept Request",
    acceptConfirm: "Accept this Request?",
    acceptConfirmMessage:
      "By accepting this request, you'll be able to chat with the requester and help them.",
    requestAccepted: "Request Accepted!",
    requestAcceptedMessage:
      "You have accepted this request. You can now chat with the requester.",
    cannotAcceptOwnRequest: "You cannot accept your own request.",
    requestAlreadyAccepted: "This request has already been accepted.",
    failedToAcceptRequest: "Failed to accept request. Please try again.",
    failedToSendMessage: "Failed to send message. Please try again.",
    failedToFinalizeRequest: "Failed to finalize request. Please try again.",
    accepting: "Accepting...",
    finalizing: "Finalizing...",
    noMessages: "No messages yet",
    startConversation: "Start the conversation!",
    acceptedBy: "Accepted by",
    requestFinalizedStatus: "This request has been finalized",

    // Status
    statusOpen: "Open",
    statusAccepted: "Accepted",
    statusFinalized: "Finalized",
  },
  tr: {
    // Home Screen
    welcome: "METU HELP'e Hoş geldiniz!",
    tagline: "Anında kampüs desteği için diğer öğrencilerle bağlantıya geçin",
    needHelp: "YARDIM İSTE",
    offerHelp: "YARDIM ET",
    activeRequests: "Aktif İstekler",
    helpedToday: "Bugün Yardım Edilen",
    urgentNeeds: "ACİL İHTİYAÇLAR",
    requestHelp: "Yardım İste",
    helpOthers: "Başkalarına Yardım Et!",
    qAndAForum: "Soru & Cevap Forumu",
    qAndAForumDescription:
      "Soru sorun, çözümler paylaşın ve ODTÜ topluluğu ile etkileşime geçin",
    activeRequestsOnCampus: "Kampüste Aktif İstekler",

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
    answers: "cevap",
    answer: "cevap",
    postAnswer: "Cevap Gönder",
    postQuestion: "Soru Gönder",
    writeAnswer: "Cevabınızı yazın...",
    acceptAnswer: "Cevabı Kabul Et",
    acceptedAnswer: "Kabul Edilen Cevap",
    editQuestion: "Soruyu Düzenle",
    deleteQuestion: "Soruyu Sil",
    editAnswer: "Cevabı Düzenle",
    deleteAnswer: "Cevabı Sil",
    questionPosted: "Soru Gönderildi!",
    questionPostedMessage: "Sorunuz başarıyla gönderildi.",
    answerPosted: "Cevap Gönderildi!",
    answerAccepted: "Cevap Kabul Edildi!",
    failedToPostQuestion: "Soru gönderilemedi",
    failedToPostAnswer: "Cevap gönderilemedi",
    failedToVote: "Oy kaydedilemedi",
    noAnswersYet: "Henüz cevap yok",
    beFirstToAnswer: "İlk cevap veren siz olun!",
    tags: "Etiketler",
    addTags: "Etiket ekle (isteğe bağlı)",
    tagsOptional: "Etiketler başkalarının sorunuzu bulmasına yardımcı olur",
    yourQuestion: "Sorunuz",
    questionTitle: "Soru Başlığı",
    questionBody: "Ek Detaylar (İsteğe bağlı)",
    questionTitlePlaceholder: "Örn: Kampüste en iyi çalışma yerleri?",
    questionBodyPlaceholder:
      "Başkalarının sorunuzu anlamasına yardımcı olmak için daha fazla bağlam sağlayın...",
    tipsForGoodQuestions: "İyi sorular için ipuçları",
    beSpecific: "Açık ve net olun",
    chooseRightCategory: "Doğru kategoriyi seçin",
    checkIfAskedBefore: "Daha önce sorulup sorulmadığını kontrol edin",
    loadingQuestions: "Sorular yükleniyor...",
    loadingQuestion: "Soru yükleniyor...",
    deleteQuestionConfirm: "Soru Silinsin mi?",
    deleteQuestionConfirmMessage:
      "Bu soruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    questionDeleted: "Soru Silindi",
    questionDeletedMessage: "Sorunuz başarıyla silindi.",
    failedToDeleteQuestion: "Soru silinemedi",
    deleteRequestConfirm: "İstek Silinsin mi?",
    deleteRequestConfirmMessage:
      "Bu isteği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    requestDeleted: "İstek Silindi",
    requestDeletedMessage: "İsteğiniz başarıyla silindi.",
    failedToDeleteRequest: "İstek silinemedi",
    delete: "Sil",

    // Categories for Q&A
    classes: "Dersler",
    professors: "Hocalar",
    campusLife: "Kampüs Yaşamı",

    // Browse Screen
    needs: "İhtiyaçlar",
    questions: "Sorular",
    search: "Ara...",
    noActiveRequests: "Aktif talep yok. İlk yayınlayan siz olun!",
    noRequestsFound: "Talep bulunamadı",

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
    questionsAsked: "Sorulan Sorular",
    myActivity: "Aktivitelerim",
    recentActivity: "Son Aktiviteler",
    noRecentActivity: "Son aktivite yok",
    viewAll: "Tümünü Gör",
    accountInfo: "Hesap Bilgileri",
    memberSince: "Üyelik tarihi",
    settings: "Ayarlar",

    // Auth
    welcomeBack: "Tekrar Hoş Geldiniz",
    signInToContinue: "ODTÜ topluluğuna yardım etmeye devam edin",
    createAccount: "Hesap Oluştur",
    joinMetuCommunity: "ODTÜ Yardım topluluğuna katılın",
    email: "E-posta",
    metuEmail: "ODTÜ E-posta",
    password: "Şifre",
    confirmPassword: "Şifre Onayı",
    rememberMe: "Beni Hatırla",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    dontHaveAccount: "Hesabınız yok mu?",
    alreadyHaveAccount: "Zaten hesabınız var mı?",
    emailPlaceholder: "e.posta@metu.edu.tr",
    passwordPlaceholder: "Şifrenizi girin",
    confirmPasswordPlaceholder: "Şifrenizi onaylayın",
    onlyMetuEmailsAllowed: "Sadece @metu.edu.tr e-posta adresleri kabul edilir",
    passwordRequirements: "En az 8 karakter ve 1 rakam içermeli",
    passwordsDontMatch: "Şifreler eşleşmiyor",
    loginFailed: "Giriş başarısız",
    registrationFailed: "Kayıt başarısız",
    registrationSuccessful: "Kayıt Başarılı!",
    verificationEmailSent: "Doğrulama E-postası Gönderildi",
    verificationEmailSentMessage:
      "Lütfen e-postanızı kontrol edin ve kaydınızı tamamlamak için doğrulama bağlantısına tıklayın.",
    emailNotVerified: "E-posta Doğrulanmadı",
    emailNotVerifiedMessage:
      "Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın. Gelen kutunuzda doğrulama bağlantısını kontrol edin.",
    resendVerification: "Doğrulama E-postasını Tekrar Gönder",
    success: "Başarılı",
    error: "Hata",
    failedToSendVerification: "Doğrulama e-postası gönderilemedi",
    ok: "Tamam",
    logoutFailed: "Çıkış yapılamadı",
    emailVerified: "Doğrulandı",
    forgotPassword: "Şifremi Unuttum?",
    resetPassword: "Şifreyi Sıfırla",
    enterEmailForReset:
      "Şifre sıfırlama bağlantısı almak için e-posta adresinizi girin",
    sendResetLink: "Sıfırlama Bağlantısı Gönder",
    passwordResetEmailSent: "Şifre sıfırlama e-postası gönderildi!",
    passwordResetEmailSentMessage:
      "Şifrenizi sıfırlamak için lütfen gelen kutunuzu kontrol edin.",
    invalidEmail: "Geçersiz e-posta formatı",
    emailRequired: "E-posta gereklidir",
    verifyYourEmail: "E-postanızı Doğrulayın",
    goToLogin: "Giriş Sayfasına Git",
    checkYourInbox:
      "@metu.edu.tr adresinize bir doğrulama bağlantısı gönderdik.\n\nLütfen gelen kutunuzu (ve spam klasörünü) kontrol edin ve erişimi açmak için hesabınızı doğrulayın.",

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

    // Post Need Form
    whatDoYouNeed: "Neye ihtiyacınız var?",
    itemNamePlaceholder: "Örn: 1 Bandaj Lazim",
    category: "Kategori",
    location: "Konum",
    additionalDetails: "Ek Detaylar (Opsiyonel)",
    additionalDetailsPlaceholder: "Yardımcı olabilecek ekstra bilgiler...",
    markAsUrgent: "Acil olarak işaretle",
    urgentHint: "Sadece zamana duyarlı istekler için kullanın",
    postRequest: "İsteği Gönder",
    isReturnNeeded: "Eşyanın iade edilmesi gerekiyor",
    returnNeededHint: "Eşyayı iade etmeniz gerekiyorsa işaretleyin",
    postAnonymously: "Anonim Olarak Gönder",
    anonymousHint: "Adınız diğer kullanıcılardan gizlenecek",
    requestPosted: "İstek Gönderildi!",
    requestPostedMessage:
      "İsteğiniz yayınlandı. Diğer öğrenciler bilgilendirilecek.",
    mustBeLoggedIn: "İstek göndermek için giriş yapmalısınız.",
    failedToPostRequest: "İstek gönderilemedi. Lütfen tekrar deneyin.",
    posting: "Gönderiliyor...",
    title: "Başlık",
    pleaseCompleteRequired:
      "Lütfen göndermeden önce başlık girin, kategori seçin ve konum seçin.",

    // Chat
    chat: "Sohbet",
    typeMessage: "Mesaj yazın...",
    send: "Gönder",
    finalizeRequest: "İsteği Tamamla",
    finalizeConfirm: "İstek Tamamlansın mı?",
    finalizeConfirmMessage:
      "Bu isteği tamamlamak istediğinizden emin misiniz? Bu işlem sohbeti kapatacak ve isteği tamamlandı olarak işaretleyecek.",
    requestFinalized: "İstek Tamamlandı",
    requestFinalizedMessage:
      "İstek başarıyla tamamlandı. Yardımınız için teşekkürler!",
    acceptRequest: "İsteği Kabul Et",
    acceptConfirm: "Bu İsteği Kabul Et?",
    acceptConfirmMessage:
      "Bu isteği kabul ederek, istekte bulunan kişiyle sohbet edebilir ve yardımcı olabilirsiniz.",
    requestAccepted: "İstek Kabul Edildi!",
    requestAcceptedMessage:
      "Bu isteği kabul ettiniz. Artık istekte bulunan kişiyle sohbet edebilirsiniz.",
    cannotAcceptOwnRequest: "Kendi isteğinizi kabul edemezsiniz.",
    requestAlreadyAccepted: "Bu istek zaten kabul edildi.",
    failedToAcceptRequest: "İstek kabul edilemedi. Lütfen tekrar deneyin.",
    failedToSendMessage: "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
    failedToFinalizeRequest: "İstek tamamlanamadı. Lütfen tekrar deneyin.",
    accepting: "Kabul ediliyor...",
    finalizing: "Tamamlanıyor...",
    noMessages: "Henüz mesaj yok",
    startConversation: "Sohbeti başlatın!",
    acceptedBy: "Kabul eden",
    requestFinalizedStatus: "Bu istek tamamlandı",

    // Status
    statusOpen: "Açık",
    statusAccepted: "Kabul Edildi",
    statusFinalized: "Tamamlandı",
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
