/**
 * LocationFilterDropdown - Dropdown-style location filter component
 *
 * Provides an expandable/collapsible dropdown filter for location selection,
 * similar to online shopping filters. Replaces horizontal scrollable chips
 * for improved scalability and discoverability.
 */

import React, { useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import {
  LOCATIONS,
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

interface LocationFilterDropdownProps {
  selectedLocation: string | null;
  onLocationChange: (locationId: string | null) => void;
  language: "en" | "tr";
}

export function LocationFilterDropdown({
  selectedLocation,
  onLocationChange,
  language,
}: LocationFilterDropdownProps) {
  const { theme, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const rotation = useSharedValue(0);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newState = !isExpanded;
    setIsExpanded(newState);
    rotation.value = withTiming(newState ? 180 : 0, { duration: 200 });

    // Reset expanded category when collapsing
    if (!newState) {
      setExpandedCategory(null);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleLocationSelect = (locationId: string | null) => {
    onLocationChange(locationId);
    // Optionally collapse after selection
    // setIsExpanded(false);
    // setExpandedCategory(null);
  };

  const getSelectedLocationLabel = (): string => {
    if (!selectedLocation) {
      return language === "en" ? "All Locations" : "Tüm Konumlar";
    }
    const location = LOCATIONS.find((loc) => loc.id === selectedLocation);
    if (!location) return selectedLocation;
    return language === "en" ? location.labelEn : location.labelTr;
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Header */}
      <Pressable
        onPress={toggleExpanded}
        style={({ pressed }) => [
          styles.header,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Feather
            name="map-pin"
            size={20}
            color={
              selectedLocation
                ? isDark
                  ? "#FF6B6B"
                  : METUColors.maroon
                : theme.textSecondary
            }
          />
          <ThemedText
            style={[
              styles.headerText,
              {
                color: selectedLocation ? theme.text : theme.textSecondary,
                fontWeight: selectedLocation ? "600" : "400",
              },
            ]}
          >
            {getSelectedLocationLabel()}
          </ThemedText>
        </View>
        <Animated.View style={animatedIconStyle}>
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        </Animated.View>
      </Pressable>

      {/* Dropdown Content */}
      {isExpanded && (
        <View
          style={[
            styles.dropdownContent,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {/* All Locations Option */}
          <Pressable
            onPress={() => handleLocationSelect(null)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor:
                  !selectedLocation && !expandedCategory
                    ? isDark
                      ? "rgba(204, 51, 51, 0.1)"
                      : "rgba(128, 0, 0, 0.05)"
                    : pressed
                      ? theme.backgroundSecondary
                      : "transparent",
              },
            ]}
          >
            <Feather
              name="map-pin"
              size={16}
              color={
                !selectedLocation
                  ? isDark
                    ? "#FF6B6B"
                    : METUColors.maroon
                  : theme.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: !selectedLocation ? theme.text : theme.textSecondary,
                  fontWeight: !selectedLocation ? "600" : "400",
                },
              ]}
            >
              {language === "en" ? "All Locations" : "Tüm Konumlar"}
            </ThemedText>
            {!selectedLocation && (
              <Feather
                name="check"
                size={16}
                color={isDark ? "#FF6B6B" : METUColors.maroon}
                style={styles.checkIcon}
              />
            )}
          </Pressable>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Category Options */}
          {LOCATION_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const categoryLocations = getLocationsByCategory(
              category.id as LocationCategoryId,
            );

            return (
              <View key={category.id}>
                {/* Category Header */}
                <Pressable
                  onPress={() => handleCategoryPress(category.id)}
                  style={({ pressed }) => [
                    styles.categoryOption,
                    {
                      backgroundColor: pressed
                        ? theme.backgroundSecondary
                        : "transparent",
                    },
                  ]}
                >
                  <View style={styles.categoryContent}>
                    <Feather
                      name={category.icon}
                      size={16}
                      color={theme.text}
                    />
                    <ThemedText style={styles.categoryText}>
                      {language === "en" ? category.labelEn : category.labelTr}
                    </ThemedText>
                  </View>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={theme.textSecondary}
                  />
                </Pressable>

                {/* Category Locations */}
                {isExpanded &&
                  categoryLocations.map((location) => {
                    const isSelected = selectedLocation === location.id;
                    return (
                      <Pressable
                        key={location.id}
                        onPress={() => handleLocationSelect(location.id)}
                        style={({ pressed }) => [
                          styles.locationOption,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(204, 51, 51, 0.1)"
                                : "rgba(128, 0, 0, 0.05)"
                              : pressed
                                ? theme.backgroundSecondary
                                : "transparent",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.locationText,
                            {
                              color: isSelected
                                ? theme.text
                                : theme.textSecondary,
                              fontWeight: isSelected ? "600" : "400",
                            },
                          ]}
                        >
                          {language === "en"
                            ? location.labelEn
                            : location.labelTr}
                        </ThemedText>
                        {isSelected && (
                          <Feather
                            name="check"
                            size={16}
                            color={isDark ? "#FF6B6B" : METUColors.maroon}
                            style={styles.checkIcon}
                          />
                        )}
                      </Pressable>
                    );
                  })}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  headerText: {
    fontSize: Typography.body.fontSize,
  },
  dropdownContent: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 400,
    overflow: "scroll",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  optionText: {
    fontSize: Typography.body.fontSize,
    flex: 1,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  locationText: {
    fontSize: Typography.small.fontSize,
    flex: 1,
  },
});
