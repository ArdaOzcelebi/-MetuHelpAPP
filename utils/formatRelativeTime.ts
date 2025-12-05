type SupportedLanguage = "en" | "tr";

type RelativeTimeStyle = "short" | "long";

type TimeUnit = "minute" | "hour" | "day";

const SHORT_UNITS: Record<SupportedLanguage, Record<TimeUnit, string>> = {
  en: { minute: "min", hour: "h", day: "d" },
  tr: { minute: "dk", hour: "sa", day: "g" },
};

const LONG_UNITS: Record<SupportedLanguage, Record<TimeUnit, string>> = {
  en: { minute: "minute", hour: "hour", day: "day" },
  tr: { minute: "dakika", hour: "saat", day: "gun" },
};

export function formatRelativeTime(
  timestamp: number,
  language: SupportedLanguage,
  style: RelativeTimeStyle = "short"
): string {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes < 1) {
    return style === "short"
      ? language === "en"
        ? "<1 min"
        : "<1 dk"
      : language === "en"
        ? "just now"
        : "az once";
  }

  if (totalMinutes < 60) {
    return formatValue(totalMinutes, "minute", language, style);
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return formatValue(totalHours, "hour", language, style);
  }

  const totalDays = Math.floor(totalHours / 24);
  return formatValue(totalDays, "day", language, style);
}

function formatValue(
  value: number,
  unit: TimeUnit,
  language: SupportedLanguage,
  style: RelativeTimeStyle
) {
  if (style === "short") {
    const suffix = SHORT_UNITS[language][unit];
    return `${value} ${suffix}`;
  }

  const label = LONG_UNITS[language][unit];
  if (language === "en") {
    const pluralized = value === 1 ? label : `${label}s`;
    return `${value} ${pluralized} ago`;
  }

  return `${value} ${label} once`;
}
