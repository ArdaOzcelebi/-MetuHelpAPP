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
    id: "dormitories",
    labelEn: "Dormitories & Housing",
    labelTr: "Yurtlar & Konaklama",
    icon: "home" as const,
  },
  {
    id: "academic",
    labelEn: "Academic Buildings",
    labelTr: "Akademik Binalar",
    icon: "book" as const,
  },
  {
    id: "services",
    labelEn: "Academic & Student Services",
    labelTr: "Akademik & Öğrenci Hizmetleri",
    icon: "briefcase" as const,
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
    icon: "activity" as const,
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

  // Dormitories & Housing
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
    id: "aysel_sabuncu",
    labelEn: "Aysel Sabuncu Guesthouse",
    labelTr: "Aysel Sabuncu Misafirhanesi",
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
  {
    id: "faik_hiziroglu",
    labelEn: "Faik Hızıroğlu Guest House",
    labelTr: "Faik Hızıroğlu Misafirhanesi",
    category: "dormitories",
  },
  {
    id: "osman_yazici",
    labelEn: "Osman Yazıcı Guesthouse",
    labelTr: "Osman Yazıcı Misafirhanesi",
    category: "dormitories",
  },

  // Academic Buildings
  {
    id: "computer_eng",
    labelEn: "Computer Engineering Building",
    labelTr: "Bilgisayar Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "electrical_eng",
    labelEn: "Electrical & Electronics Engineering Building",
    labelTr: "Elektrik Elektronik Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "civil_eng",
    labelEn: "Civil Engineering Building",
    labelTr: "İnşaat Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "industrial_eng",
    labelEn: "Industrial Engineering Building",
    labelTr: "Endüstri Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "physics_dept",
    labelEn: "Physics Department Building",
    labelTr: "Fizik Bölümü Binası",
    category: "academic",
  },
  {
    id: "environmental_eng",
    labelEn: "Environmental Engineering Building",
    labelTr: "Çevre Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "geological_eng",
    labelEn: "Geological Engineering Building",
    labelTr: "Jeoloji Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "food_eng",
    labelEn: "Food Engineering Building",
    labelTr: "Gıda Mühendisliği Binası",
    category: "academic",
  },
  {
    id: "feas",
    labelEn: "Faculty of Economics & Administrative Sciences (FEAS)",
    labelTr: "İktisadi ve İdari Bilimler Fakültesi (İİBF)",
    category: "academic",
  },
  {
    id: "informatics_inst",
    labelEn: "Informatics Institute",
    labelTr: "Enformatik Enstitüsü",
    category: "academic",
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
    id: "carsi",
    labelEn: "Çarşı (Shopping Center)",
    labelTr: "Çarşı (Alışveriş Merkezi)",
    category: "daily_life",
  },
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
