/**
 * LocationCategoryFilter - Horizontal category-based location filter
 *
 * Displays location categories as horizontal scrollable chips.
 * Allows filtering by category (e.g., "Dormitories & Housing") and
 * individual location selection within categories.
 */

import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import {
  LOCATION_CATEGORIES,
  getLocationsByCategory,
  type LocationCategoryId,
} from "@/constants/locations";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LocationCategoryFilterProps {
  selectedLocation: string | null;
  selectedCategory: string | null;
  onLocationChange: (locationId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
  language: "en" | "tr";
  showAllLocations?: boolean; // Optional prop to show/hide "All Locations" option
}

export function LocationCategoryFilter({
  selectedLocation,
  selectedCategory,
  onLocationChange,
  onCategoryChange,
  language,
  showAllLocations = true, // Default to true for backward compatibility
}: LocationCategoryFilterProps) {
  const { theme, isDark } = useTheme();

  const handleCategoryPress = (categoryId: string | null) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onCategoryChange(categoryId);
    // Reset location selection when category changes
    if (categoryId !== selectedCategory) {
      onLocationChange(null);
    }
  };

  const handleLocationPress = (locationId: string) => {
    onLocationChange(locationId);
  };

  const renderCategoryChip = (
    categoryId: string | null,
    label: string,
    icon: keyof typeof Feather.glyphMap,
  ) => {
    const isSelected = selectedCategory === categoryId;

    return (
      <Pressable
        key={categoryId || "all"}
        onPress={() => handleCategoryPress(categoryId)}
        style={({ pressed }) => [
          styles.categoryChip,
          {
            backgroundColor: isSelected
              ? isDark
                ? "#CC3333"
                : METUColors.maroon
              : theme.backgroundDefault,
            borderWidth: isSelected ? 0 : 1,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Feather
          name={icon}
          size={14}
          color={isSelected ? "#FFFFFF" : theme.text}
          style={styles.chipIcon}
        />
        <ThemedText
          style={[
            styles.chipText,
            {
              color: isSelected ? "#FFFFFF" : theme.text,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderLocationChip = (locationId: string, label: string) => {
    const isSelected = selectedLocation === locationId;

    return (
      <Pressable
        key={locationId}
        onPress={() => handleLocationPress(locationId)}
        style={({ pressed }) => [
          styles.locationChip,
          {
            backgroundColor: isSelected
              ? isDark
                ? "#CC3333"
                : METUColors.maroon
              : theme.backgroundDefault,
            borderWidth: isSelected ? 0 : 1,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.chipText,
            {
              color: isSelected ? "#FFFFFF" : theme.text,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Filter - Horizontal Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Locations - Only show when showAllLocations is true */}
        {showAllLocations &&
          renderCategoryChip(
            null,
            language === "en" ? "All Locations" : "Tüm Konumlar",
            "map-pin",
          )}

        {/* Category Chips */}
        {LOCATION_CATEGORIES.map((category) =>
          renderCategoryChip(
            category.id,
            language === "en" ? category.labelEn : category.labelTr,
            category.icon,
          ),
        )}
      </ScrollView>

      {/* Location Sub-Filter - Only show when a category is selected */}
      {selectedCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            styles.subFilterContent,
          ]}
        >
          {/* Back/Clear button */}
          <Pressable
            onPress={() => handleCategoryPress(null)}
            style={({ pressed }) => [
              styles.backChip,
              {
                backgroundColor: theme.backgroundDefault,
                borderWidth: 1,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={14}
              color={theme.text}
              style={styles.chipIcon}
            />
            <ThemedText
              style={[
                styles.chipText,
                { color: theme.text, fontWeight: "500" },
              ]}
            >
              {language === "en" ? "Back" : "Geri"}
            </ThemedText>
          </Pressable>

          {/* Location Chips for Selected Category */}
          {getLocationsByCategory(selectedCategory as LocationCategoryId).map(
            (location) =>
              renderLocationChip(
                location.id,
                language === "en" ? location.labelEn : location.labelTr,
              ),
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    // Fix web scrolling: prevent content from growing/shrinking
    // This ensures horizontal ScrollView works correctly on web browsers
    flexGrow: 0,
    flexShrink: 0,
  },
  subFilterContent: {
    marginTop: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 36,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 36,
  },
  backChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 36,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.small.fontSize,
    // Prevent text wrapping on web for proper horizontal scrolling
    ...(Platform.OS === "web" && { whiteSpace: "nowrap" as any }),
  },
});
