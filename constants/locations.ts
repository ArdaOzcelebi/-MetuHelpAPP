/**
 * Campus locations for METU Help App
 * Used in PostNeedScreen and BrowseScreen for location selection and filtering
 */

export const LOCATIONS = [
  // Gates & Transportation
  { id: "a1_gate", labelEn: "A1 Gate", labelTr: "A1 Kapısı" },
  { id: "a2_gate", labelEn: "A2 Gate (Metro)", labelTr: "A2 Kapısı (Metro)" },
  { id: "a4_gate", labelEn: "A4 Gate", labelTr: "A4 Kapısı" },
  { id: "a7_gate", labelEn: "A7 Gate", labelTr: "A7 Kapısı" },
  { id: "a8_gate", labelEn: "A8 Gate (Teknokent)", labelTr: "A8 Kapısı (Teknokent)" },
  { id: "a9_gate", labelEn: "A9 Gate", labelTr: "A9 Kapısı" },
  
  // Dormitories & Housing
  { id: "dorm_1", labelEn: "1st Dormitory", labelTr: "1. Yurt" },
  { id: "dorm_2", labelEn: "2nd Dormitory", labelTr: "2. Yurt" },
  { id: "dorm_3", labelEn: "3rd Dormitory", labelTr: "3. Yurt" },
  { id: "dorm_4", labelEn: "4th Dormitory", labelTr: "4. Yurt" },
  { id: "dorm_5", labelEn: "5th Dormitory", labelTr: "5. Yurt" },
  { id: "dorm_6", labelEn: "6th Dormitory", labelTr: "6. Yurt" },
  { id: "dorm_7", labelEn: "7th Dormitory", labelTr: "7. Yurt" },
  { id: "dorm_8", labelEn: "8th Dormitory", labelTr: "8. Yurt" },
  { id: "dorm_9", labelEn: "9th Dormitory", labelTr: "9. Yurt" },
  { id: "aysel_sabuncu", labelEn: "Aysel Sabuncu Guesthouse", labelTr: "Aysel Sabuncu Misafirhanesi" },
  { id: "refika_aksoy", labelEn: "Refika Aksoy Dormitory", labelTr: "Refika Aksoy Yurdu" },
  { id: "faika_demiray", labelEn: "Faika Demiray Dormitory", labelTr: "Faika Demiray Yurdu" },
  { id: "isa_demiray", labelEn: "İsa Demiray Dormitory", labelTr: "İsa Demiray Yurdu" },
  { id: "faik_hiziroglu", labelEn: "Faik Hızıroğlu Guest House", labelTr: "Faik Hızıroğlu Misafirhanesi" },
  { id: "osman_yazici", labelEn: "Osman Yazıcı Guesthouse", labelTr: "Osman Yazıcı Misafirhanesi" },
  
  // Academic Buildings
  { id: "computer_eng", labelEn: "Computer Engineering Building", labelTr: "Bilgisayar Mühendisliği Binası" },
  { id: "electrical_eng", labelEn: "Electrical & Electronics Engineering Building", labelTr: "Elektrik Elektronik Mühendisliği Binası" },
  { id: "civil_eng", labelEn: "Civil Engineering Building", labelTr: "İnşaat Mühendisliği Binası" },
  { id: "industrial_eng", labelEn: "Industrial Engineering Building", labelTr: "Endüstri Mühendisliği Binası" },
  { id: "physics_dept", labelEn: "Physics Department Building", labelTr: "Fizik Bölümü Binası" },
  { id: "environmental_eng", labelEn: "Environmental Engineering Building", labelTr: "Çevre Mühendisliği Binası" },
  { id: "geological_eng", labelEn: "Geological Engineering Building", labelTr: "Jeoloji Mühendisliği Binası" },
  { id: "food_eng", labelEn: "Food Engineering Building", labelTr: "Gıda Mühendisliği Binası" },
  { id: "feas", labelEn: "Faculty of Economics & Administrative Sciences (FEAS)", labelTr: "İktisadi ve İdari Bilimler Fakültesi (İİBF)" },
  { id: "informatics_inst", labelEn: "Informatics Institute", labelTr: "Enformatik Enstitüsü" },
  
  // Academic & Student Services
  { id: "library", labelEn: "Library", labelTr: "Kütüphane" },
  { id: "academic_writing", labelEn: "Academic Writing Center", labelTr: "Akademik Yazım Merkezi" },
  { id: "european_doc", labelEn: "European Documentation Center", labelTr: "Avrupa Dokümantasyon Merkezi" },
  
  // Daily Life & Central Services
  { id: "carsi", labelEn: "Çarşı (Shopping Center)", labelTr: "Çarşı (Alışveriş Merkezi)" },
  { id: "teknokent", labelEn: "Research Park / ODTÜ Teknokent", labelTr: "Araştırma Parkı / ODTÜ Teknokent" },
  { id: "knowledge_transfer", labelEn: "Knowledge Transfer Office", labelTr: "Bilgi Transfer Ofisi" },
  
  // Sports & Recreation
  { id: "devrim_stadium", labelEn: "Devrim Stadium", labelTr: "Devrim Stadyumu" },
  { id: "odtu_gymnasium", labelEn: "ODTÜ Gymnasium (BSS)", labelTr: "ODTÜ Spor Salonu (BSS)" },
  { id: "baraka_gymnasium", labelEn: "Baraka Gymnasium", labelTr: "Baraka Spor Salonu" },
  { id: "odtukent_gymnasium", labelEn: "ODTÜKENT Gymnasium", labelTr: "ODTÜKENT Spor Salonu" },
  
  // Other
  { id: "other", labelEn: "Other", labelTr: "Diğer" },
] as const;

export type LocationId = typeof LOCATIONS[number]["id"];
