/**
 * Campus locations for METU Help App
 * Used in PostNeedScreen, BrowseScreen, and NeedHelpScreen for location selection and filtering
 */

// Location category definitions
export const LOCATION_CATEGORIES = [
  {
    id: "gates",
    labelEn: "Gates & Transportation",
    labelTr: "Kapılar & Ulaşım",
    icon: "navigation" as const,
  },
  {
    id: "administration",
    labelEn: "Administration & Social Areas",
    labelTr: "Yönetim & Sosyal Alanlar",
    icon: "briefcase" as const,
  },
  {
    id: "dormitories",
    labelEn: "Dormitories & Guest Houses",
    labelTr: "Yurtlar & Misafirhaneler",
    icon: "home" as const,
  },
  {
    id: "faculties",
    labelEn: "Faculties & Academic Units",
    labelTr: "Fakülteler & Akademik Birimler",
    icon: "book" as const,
  },
  {
    id: "student_life",
    labelEn: "Student Life & Extra Academic",
    labelTr: "Öğrenci Yaşamı & Ek Akademik",
    icon: "users" as const,
  },
  {
    id: "health",
    labelEn: "Health Facilities",
    labelTr: "Sağlık Tesisleri",
    icon: "activity" as const,
  },
  {
    id: "services",
    labelEn: "Academic & Student Services",
    labelTr: "Akademik & Öğrenci Hizmetleri",
    icon: "book-open" as const,
  },
  {
    id: "daily_life",
    labelEn: "Daily Life & Central Services",
    labelTr: "Günlük Yaşam & Merkezi Hizmetler",
    icon: "shopping-cart" as const,
  },
  {
    id: "sports",
    labelEn: "Sports & Recreation",
    labelTr: "Spor & Rekreasyon",
    icon: "award" as const,
  },
  {
    id: "other",
    labelEn: "Other",
    labelTr: "Diğer",
    icon: "map-pin" as const,
  },
] as const;

export const LOCATIONS = [
  // Gates & Transportation
  {
    id: "a1_gate",
    labelEn: "A1 Gate",
    labelTr: "A1 Kapısı",
    category: "gates",
  },
  {
    id: "a2_gate",
    labelEn: "A2 Gate (Metro)",
    labelTr: "A2 Kapısı (Metro)",
    category: "gates",
  },
  {
    id: "a4_gate",
    labelEn: "A4 Gate",
    labelTr: "A4 Kapısı",
    category: "gates",
  },
  {
    id: "a7_gate",
    labelEn: "A7 Gate",
    labelTr: "A7 Kapısı",
    category: "gates",
  },
  {
    id: "a8_gate",
    labelEn: "A8 Gate (Teknokent)",
    labelTr: "A8 Kapısı (Teknokent)",
    category: "gates",
  },
  {
    id: "a9_gate",
    labelEn: "A9 Gate",
    labelTr: "A9 Kapısı",
    category: "gates",
  },

  // Administration & Social Areas
  {
    id: "rektorluk",
    labelEn: "Rektörlük (President's Office)",
    labelTr: "Rektörlük",
    category: "administration",
  },
  {
    id: "shopping_center",
    labelEn: "Shopping Center (Çarşı)",
    labelTr: "Çarşı (Alışveriş Merkezi)",
    category: "administration",
  },
  {
    id: "cati_cafe",
    labelEn: "Çatı Cafe",
    labelTr: "Çatı Cafe",
    category: "administration",
  },

  // Dormitories & Guest Houses
  {
    id: "dorm_1",
    labelEn: "1st Dormitory",
    labelTr: "1. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_2",
    labelEn: "2nd Dormitory",
    labelTr: "2. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_3",
    labelEn: "3rd Dormitory",
    labelTr: "3. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_4",
    labelEn: "4th Dormitory",
    labelTr: "4. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_5",
    labelEn: "5th Dormitory",
    labelTr: "5. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_6",
    labelEn: "6th Dormitory",
    labelTr: "6. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_7",
    labelEn: "7th Dormitory",
    labelTr: "7. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_8",
    labelEn: "8th Dormitory",
    labelTr: "8. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_9",
    labelEn: "9th Dormitory",
    labelTr: "9. Yurt",
    category: "dormitories",
  },
  {
    id: "dorm_19",
    labelEn: "19th Dormitory",
    labelTr: "19. Yurt",
    category: "dormitories",
  },
  {
    id: "guest_house_12",
    labelEn: "12th Guest House (Sami Kırdar)",
    labelTr: "12. Misafirhane (Sami Kırdar)",
    category: "dormitories",
  },
  {
    id: "guest_house_15",
    labelEn: "15th Guest House",
    labelTr: "15. Misafirhane",
    category: "dormitories",
  },
  {
    id: "osman_yazici",
    labelEn: "Osman Yazıcı Guest House",
    labelTr: "Osman Yazıcı Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "faik_hiziroglu",
    labelEn: "Faik Hızıroğlu Guest House",
    labelTr: "Faik Hızıroğlu Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "graduate_guesthouse",
    labelEn: "Graduate Guesthouse",
    labelTr: "Lisansüstü Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "odtukent_guesthouse",
    labelEn: "ODTÜKENT Guest House",
    labelTr: "ODTÜKENT Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "ebi_guesthouse",
    labelEn: "EBİ Guest House",
    labelTr: "EBİ Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "central_guesthouse",
    labelEn: "ODTÜ Central Guest House",
    labelTr: "ODTÜ Merkez Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "aysel_sabuncu",
    labelEn: "Aysel Sabuncu Life Center",
    labelTr: "Aysel Sabuncu Yaşam Merkezi",
    category: "dormitories",
  },
  {
    id: "refika_aksoy",
    labelEn: "Refika Aksoy Dormitory",
    labelTr: "Refika Aksoy Yurdu",
    category: "dormitories",
  },
  {
    id: "faika_demiray",
    labelEn: "Faika Demiray Dormitory",
    labelTr: "Faika Demiray Yurdu",
    category: "dormitories",
  },
  {
    id: "isa_demiray",
    labelEn: "İsa Demiray Dormitory",
    labelTr: "İsa Demiray Yurdu",
    category: "dormitories",
  },

  // Faculties & Academic Units
  {
    id: "foreign_languages",
    labelEn: "School of Foreign Languages",
    labelTr: "Yabancı Diller Okulu",
    category: "faculties",
  },
  {
    id: "faculty_education",
    labelEn: "Faculty of Education",
    labelTr: "Eğitim Fakültesi",
    category: "faculties",
  },
  {
    id: "faculty_architecture",
    labelEn: "Faculty of Architecture",
    labelTr: "Mimarlık Fakültesi",
    category: "faculties",
  },
  {
    id: "faculty_engineering",
    labelEn: "Faculty of Engineering (MM / Main Engineering)",
    labelTr: "Mühendislik Fakültesi (MM)",
    category: "faculties",
  },
  {
    id: "faculty_arts_sciences",
    labelEn: "Faculty of Arts & Sciences",
    labelTr: "Fen Edebiyat Fakültesi",
    category: "faculties",
  },
  {
    id: "dept_mathematics",
    labelEn: "Department of Mathematics",
    labelTr: "Matematik Bölümü",
    category: "faculties",
  },
  {
    id: "dept_physics",
    labelEn: "Department of Physics",
    labelTr: "Fizik Bölümü",
    category: "faculties",
  },
  {
    id: "dept_chemistry",
    labelEn: "Department of Chemistry",
    labelTr: "Kimya Bölümü",
    category: "faculties",
  },
  {
    id: "dept_mechanical_eng",
    labelEn: "Mechanical Engineering Department",
    labelTr: "Makine Mühendisliği Bölümü",
    category: "faculties",
  },
  {
    id: "dept_foreign_lang_education",
    labelEn: "Department of Foreign Language Education",
    labelTr: "Yabancı Dil Eğitimi Bölümü",
    category: "faculties",
  },
  {
    id: "computer_eng",
    labelEn: "Computer Engineering Building",
    labelTr: "Bilgisayar Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "electrical_eng",
    labelEn: "Electrical & Electronics Engineering Building",
    labelTr: "Elektrik Elektronik Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "civil_eng",
    labelEn: "Civil Engineering Building",
    labelTr: "İnşaat Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "industrial_eng",
    labelEn: "Industrial Engineering Building",
    labelTr: "Endüstri Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "environmental_eng",
    labelEn: "Environmental Engineering Building",
    labelTr: "Çevre Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "geological_eng",
    labelEn: "Geological Engineering Building",
    labelTr: "Jeoloji Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "food_eng",
    labelEn: "Food Engineering Building",
    labelTr: "Gıda Mühendisliği Binası",
    category: "faculties",
  },
  {
    id: "feas",
    labelEn: "Faculty of Economics & Administrative Sciences (FEAS)",
    labelTr: "İktisadi ve İdari Bilimler Fakültesi (İİBF)",
    category: "faculties",
  },
  {
    id: "informatics_inst",
    labelEn: "Informatics Institute",
    labelTr: "Enformatik Enstitüsü",
    category: "faculties",
  },

  // Student Life & Extra Academic
  {
    id: "student_clubs",
    labelEn: "Student Clubs / Topluluk Binaları",
    labelTr: "Topluluk Binaları",
    category: "student_life",
  },
  {
    id: "prep_school",
    labelEn: "Prep School / Basic English",
    labelTr: "Hazırlık Okulu / Temel İngilizce",
    category: "student_life",
  },
  {
    id: "language_lab",
    labelEn: "Language Lab",
    labelTr: "Dil Laboratuvarı",
    category: "student_life",
  },

  // Health Facilities
  {
    id: "mediko",
    labelEn: "Student Health Center (Mediko)",
    labelTr: "Öğrenci Sağlık Merkezi (Mediko)",
    category: "health",
  },

  // Health Facilities
  {
    id: "mediko",
    labelEn: "Student Health Center (Mediko)",
    labelTr: "Öğrenci Sağlık Merkezi (Mediko)",
    category: "health",
  },

  // Academic & Student Services
  {
    id: "library",
    labelEn: "Library",
    labelTr: "Kütüphane",
    category: "services",
  },
  {
    id: "academic_writing",
    labelEn: "Academic Writing Center",
    labelTr: "Akademik Yazım Merkezi",
    category: "services",
  },
  {
    id: "european_doc",
    labelEn: "European Documentation Center",
    labelTr: "Avrupa Dokümantasyon Merkezi",
    category: "services",
  },

  // Daily Life & Central Services
  {
    id: "teknokent",
    labelEn: "Research Park / ODTÜ Teknokent",
    labelTr: "Araştırma Parkı / ODTÜ Teknokent",
    category: "daily_life",
  },
  {
    id: "knowledge_transfer",
    labelEn: "Knowledge Transfer Office",
    labelTr: "Bilgi Transfer Ofisi",
    category: "daily_life",
  },

  // Sports & Recreation
  {
    id: "devrim_stadium",
    labelEn: "Devrim Stadium",
    labelTr: "Devrim Stadyumu",
    category: "sports",
  },
  {
    id: "odtu_gymnasium",
    labelEn: "ODTÜ Gymnasium (BSS)",
    labelTr: "ODTÜ Spor Salonu (BSS)",
    category: "sports",
  },
  {
    id: "baraka_gymnasium",
    labelEn: "Baraka Gymnasium",
    labelTr: "Baraka Spor Salonu",
    category: "sports",
  },
  {
    id: "odtukent_gymnasium",
    labelEn: "ODTÜKENT Gymnasium",
    labelTr: "ODTÜKENT Spor Salonu",
    category: "sports",
  },

  // Other
  { id: "other", labelEn: "Other", labelTr: "Diğer", category: "other" },
] as const;

export type LocationId = (typeof LOCATIONS)[number]["id"];
export type LocationCategoryId = (typeof LOCATION_CATEGORIES)[number]["id"];

// Helper function to get locations by category
export function getLocationsByCategory(categoryId: LocationCategoryId) {
  return LOCATIONS.filter((loc) => loc.category === categoryId);
}
