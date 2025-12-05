import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export type RequestCategory = "medical" | "academic" | "transport" | "other";

export const LOCATION_OPTIONS = [
  { id: "library", labelEn: "Library", labelTr: "Kutuphane" },
  { id: "student_center", labelEn: "Student Center", labelTr: "Ogrenci Merkezi" },
  { id: "engineering", labelEn: "Engineering Building", labelTr: "Muhendislik Binasi" },
  { id: "physics", labelEn: "Physics Building", labelTr: "Fizik Binasi" },
  { id: "main_gate", labelEn: "Main Gate", labelTr: "Ana Kapi" },
  { id: "cafeteria", labelEn: "Cafeteria", labelTr: "Yemekhane" },
  { id: "dorms", labelEn: "Dormitory Area", labelTr: "Yurtlar Bolgesi" },
  { id: "sports", labelEn: "Sports Complex", labelTr: "Spor Kompleksi" },
  { id: "other", labelEn: "Other", labelTr: "Diger" },
] as const;

export type LocationId = (typeof LOCATION_OPTIONS)[number]["id"];
export type LocationOption = (typeof LOCATION_OPTIONS)[number];

export type RequestRecord = {
  id: string;
  titleEn: string;
  titleTr: string;
  category: RequestCategory;
  locationEn: string;
  locationTr: string;
  descriptionEn: string;
  descriptionTr: string;
  posterName: string;
  posterInitials: string;
  urgent: boolean;
  createdAt: number;
};

export type NewRequestPayload = {
  title: string;
  category: RequestCategory;
  locationId: LocationId;
  details?: string;
  urgent: boolean;
  language: "en" | "tr";
};

type RequestRow = Omit<RequestRecord, "urgent"> & { urgent: number };

type LocationMap = Record<LocationId, { en: string; tr: string }>;

const LOCATION_MAP: LocationMap = LOCATION_OPTIONS.reduce((acc, option) => {
  acc[option.id] = { en: option.labelEn, tr: option.labelTr };
  return acc;
}, {} as LocationMap);

const DEFAULT_DESCRIPTIONS = {
  en: "No additional details were provided.",
  tr: "Ek bilgi paylasilmadi.",
};

const DEFAULT_POSTER = {
  en: { name: "Community Member", initials: "CM" },
  tr: { name: "Topluluk Uyesi", initials: "TU" },
};

const isWeb = Platform.OS === "web";
const STORAGE_KEY = "metuhelp.requests";
const canUseSQLite = !isWeb && typeof SQLite.openDatabaseSync === "function";

type WebStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const database: SQLite.SQLiteDatabase | null = canUseSQLite
  ? openDatabaseSafe()
  : null;
let webCache: RequestRecord[] = [];
let isInitialized = false;

export function getAllRequests(): RequestRecord[] {
  ensureDatabase();
  if (isWeb) {
    return [...webCache].sort((a, b) => b.createdAt - a.createdAt);
  }

  if (!database) {
    return [];
  }

  const rows = database.getAllSync<RequestRow>(
    "SELECT * FROM requests ORDER BY createdAt DESC"
  );
  return rows.map(mapRow);
}

export function getRequestById(id: string): RequestRecord | undefined {
  ensureDatabase();
  if (isWeb) {
    return webCache.find((request) => request.id === id);
  }

  if (!database) {
    return undefined;
  }

  const row = database.getFirstSync<RequestRow>(
    "SELECT * FROM requests WHERE id = ?",
    id
  );
  return row ? mapRow(row) : undefined;
}

export function createRequest(payload: NewRequestPayload): RequestRecord {
  ensureDatabase();
  const normalizedDetails = payload.details?.trim();
  const locationLabels = LOCATION_MAP[payload.locationId];
  const poster = DEFAULT_POSTER[payload.language];

  const record: RequestRecord = {
    id: generateId(),
    titleEn: payload.title.trim() || "Untitled",
    titleTr: payload.title.trim() || "Basliksiz",
    category: payload.category,
    locationEn: locationLabels?.en ?? payload.locationId,
    locationTr: locationLabels?.tr ?? payload.locationId,
    descriptionEn: normalizedDetails || DEFAULT_DESCRIPTIONS.en,
    descriptionTr: normalizedDetails || DEFAULT_DESCRIPTIONS.tr,
    posterName: poster.name,
    posterInitials: poster.initials,
    urgent: payload.urgent,
    createdAt: Date.now(),
  };

  if (isWeb) {
    webCache = [record, ...webCache];
    persistWebCache();
    return record;
  }

  if (!database) {
    throw new Error("SQLite database is not available on this platform.");
  }

  database.withTransactionSync((tx) => {
    tx.runSync(
      `INSERT INTO requests (id, titleEn, titleTr, category, locationEn, locationTr, descriptionEn, descriptionTr, posterName, posterInitials, urgent, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.titleEn,
        record.titleTr,
        record.category,
        record.locationEn,
        record.locationTr,
        record.descriptionEn,
        record.descriptionTr,
        record.posterName,
        record.posterInitials,
        record.urgent ? 1 : 0,
        record.createdAt,
      ]
    );
  });

  return record;
}

function ensureDatabase() {
  if (isInitialized) {
    return;
  }

  if (!database || typeof database.execSync !== "function") {
    if (isWeb) {
      webCache = loadWebCache();
      isInitialized = true;
      return;
    }

    throw new Error("SQLite database is not available on this platform.");
  }

  database.execSync(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY NOT NULL,
      titleEn TEXT NOT NULL,
      titleTr TEXT NOT NULL,
      category TEXT NOT NULL,
      locationEn TEXT NOT NULL,
      locationTr TEXT NOT NULL,
      descriptionEn TEXT NOT NULL,
      descriptionTr TEXT NOT NULL,
      posterName TEXT NOT NULL,
      posterInitials TEXT NOT NULL,
      urgent INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);

  const countRow = database.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM requests"
  );

  if (!countRow || countRow.count === 0) {
    seedDatabase();
  }

  isInitialized = true;
}

function seedDatabase() {
  if (!database) {
    return;
  }

  const seedData = buildSeedData();

  database.withTransactionSync((tx) => {
    seedData.forEach((request) => {
      tx.runSync(
        `INSERT INTO requests (id, titleEn, titleTr, category, locationEn, locationTr, descriptionEn, descriptionTr, posterName, posterInitials, urgent, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.id,
          request.titleEn,
          request.titleTr,
          request.category,
          request.locationEn,
          request.locationTr,
          request.descriptionEn,
          request.descriptionTr,
          request.posterName,
          request.posterInitials,
          request.urgent ? 1 : 0,
          request.createdAt,
        ]
      );
    });
  });
}

function buildSeedData(): RequestRecord[] {
  const now = Date.now();
  return [
    {
      id: "1",
      titleEn: "Need 1 Bandage",
      titleTr: "1 Bandaj Lazim",
      category: "medical",
      locationEn: "Near Library",
      locationTr: "Kutuphane Yakininda",
      descriptionEn:
        "Cut my finger while studying. Nothing serious but I need a bandage to stop the bleeding. Will be at the library entrance.",
      descriptionTr:
        "Calisirken parmagi kesildi. Ciddi degil ama kanamayi durdurmak icin bandaja ihtiyacim var. Kutuphane girisindeyim.",
      posterName: "Ahmet Y.",
      posterInitials: "AY",
      urgent: true,
      createdAt: now - 5 * 60 * 1000,
    },
    {
      id: "2",
      titleEn: "Need Pain Reliever",
      titleTr: "Agri Kesici Lazim",
      category: "medical",
      locationEn: "Engineering Building",
      locationTr: "Muhendislik Binasi",
      descriptionEn:
        "Having a bad headache before my exam. Would appreciate any pain reliever. I'm in room B-104.",
      descriptionTr:
        "Sinavdan once kotu bir bas agrim var. Herhangi bir agri kesici cok iyi olur. B-104'teyim.",
      posterName: "Zeynep K.",
      posterInitials: "ZK",
      urgent: true,
      createdAt: now - 12 * 60 * 1000,
    },
    {
      id: "3",
      titleEn: "Need a Phone Charger (USB-C)",
      titleTr: "Telefon Sarj Aleti (USB-C) Lazim",
      category: "other",
      locationEn: "Student Center",
      locationTr: "Ogrenci Merkezi",
      descriptionEn:
        "My phone is at 2% and I need to call my family. Looking for a USB-C charger I can borrow for 30 minutes.",
      descriptionTr:
        "Telefonum yuzde 2'de ve ailemi aramam gerekiyor. 30 dakikaligina USB-C sarj aleti ariyorum.",
      posterName: "Mehmet A.",
      posterInitials: "MA",
      urgent: false,
      createdAt: now - 18 * 60 * 1000,
    },
    {
      id: "4",
      titleEn: "Looking for Ride to Kizilay",
      titleTr: "Kizilay'a Arac Ariyorum",
      category: "transport",
      locationEn: "Main Gate",
      locationTr: "Ana Kapi",
      descriptionEn:
        "Need to get to Kizilay for a doctor appointment at 4 PM. Can share gas costs. Will be at the main gate.",
      descriptionTr:
        "Saat 16:00'da doktor randevum icin Kizilay'a gitmem lazim. Benzin masrafini paylasabilirim. Ana kapidayim.",
      posterName: "Elif S.",
      posterInitials: "ES",
      urgent: false,
      createdAt: now - 25 * 60 * 1000,
    },
    {
      id: "5",
      titleEn: "Need Calculator for Exam",
      titleTr: "Sinav icin Hesap Makinesi Lazim",
      category: "academic",
      locationEn: "Physics Building",
      locationTr: "Fizik Binasi",
      descriptionEn:
        "Forgot my calculator and have a physics exam in 30 minutes! Need a scientific calculator urgently.",
      descriptionTr:
        "Hesap makinemi unuttum ve 30 dakika icinde fizik sinavim var! Acil bilimsel hesap makinesine ihtiyacim var.",
      posterName: "Can B.",
      posterInitials: "CB",
      urgent: true,
      createdAt: now - 32 * 60 * 1000,
    },
  ];
}

function loadWebCache(): RequestRecord[] {
  const storage = getLocalStorage();
  if (!storage) {
    return buildSeedData();
  }

  const storedValue = storage.getItem(STORAGE_KEY);
  if (storedValue) {
    try {
      const parsed = JSON.parse(storedValue) as RequestRecord[];
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.createdAt - a.createdAt);
      }
    } catch {
      storage.removeItem(STORAGE_KEY);
    }
  }

  const seedData = buildSeedData();
  storage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
}

function persistWebCache() {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(webCache));
}

function getLocalStorage(): WebStorage | undefined {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      return (globalThis as { localStorage?: WebStorage }).localStorage;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function mapRow(row: RequestRow): RequestRecord {
  return { ...row, urgent: row.urgent === 1 };
}

function generateId() {
  const random = Math.random().toString(36).slice(2, 7);
  return `${Date.now()}-${random}`;
}

function openDatabaseSafe(): SQLite.SQLiteDatabase | null {
  try {
    return SQLite.openDatabaseSync("metuhelp.db");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to open SQLite database", error);
    }
    return null;
  }
}
