import { Platform } from "react-native";

export const METUColors = {
  maroon: "#800000",
  maroonLight: "#9A2020",
  maroonDark: "#600000",
  actionGreen: "#10B981",
  actionGreenDark: "#059669",
  alertRed: "#DC2626",
  gold: "#D4AF37",
  white: "#FFFFFF",
  offWhite: "#FAFAFA",
  lightGray: "#E5E5E5",
  darkGray: "#1A1A1A",
};

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#666666",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: METUColors.maroon,
    link: METUColors.maroon,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E0E0E0",
    border: "#E5E5E5",
    cardBackground: "#FFFFFF",
    success: METUColors.actionGreen,
    error: METUColors.alertRed,
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF6B6B",
    link: "#FF6B6B",
    backgroundRoot: "#1A1A1A",
    backgroundDefault: "#2A2A2A",
    backgroundSecondary: "#333333",
    backgroundTertiary: "#404040",
    border: "#404040",
    cardBackground: "#2A2A2A",
    success: METUColors.actionGreen,
    error: METUColors.alertRed,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 48,
  buttonHeight: 52,
  largeButtonHeight: 80,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
