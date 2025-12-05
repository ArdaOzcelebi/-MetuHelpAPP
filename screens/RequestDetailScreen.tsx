import React, { useMemo, useState } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRequestById } from "@/services/requestsStore";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import {
  Spacing,
  BorderRadius,
  METUColors,
  Typography,
} from "@/constants/theme";
import type { HomeStackParamList } from "@/navigation/HomeStackNavigator";

type RequestDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "RequestDetail">;
  route: RouteProp<HomeStackParamList, "RequestDetail">;
};

export default function RequestDetailScreen({
  navigation,
  route,
}: RequestDetailScreenProps) {
  const { theme, isDark } = useTheme();
  const { t, language } = useLanguage();
  const { requestId } = route.params;
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);

  const request = useMemo(() => getRequestById(requestId), [requestId]);

  if (!request) {
    return (
      <ScreenScrollView>
        <ThemedText style={styles.missingRequest}>
          {language === "en" ? "Request not found." : "Istek bulunamadi."}
        </ThemedText>
      </ScreenScrollView>
    );
  }

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    switch (request.category) {
      case "medical":
        return "activity";
      case "academic":
        return "book";
      case "transport":
        return "navigation";
      default:
        return "help-circle";
    }
  };

  const getCategoryLabel = () => {
    switch (request.category) {
      case "medical":
        return t.medical;
      case "academic":
        return t.academic;
      case "transport":
        return t.transport;
      default:
        return t.other;
    }
  };

  const postedTimeLabel = formatRelativeTime(request.createdAt, language, "long");
  const localizedTitle = language === "en" ? request.titleEn : request.titleTr;
  const localizedLocation =
    language === "en" ? request.locationEn : request.locationTr;
  const localizedDescription =
    language === "en" ? request.descriptionEn : request.descriptionTr;

  const alertMessages = language === "en"
    ? {
        alreadyTitle: "Already Offered",
        alreadyBody: "You've already offered to help with this request.",
        successTitle: "Help Offered!",
        successBody: `Thank you for offering to help ${request.posterName}! They will be notified.`,
        ok: "OK",
      }
    : {
        alreadyTitle: "Zaten Bildirdin",
        alreadyBody: "Bu istege zaten yardim teklif ettin.",
        successTitle: "Yardim Gonderildi!",
        successBody: `${request.posterName} icin yardim teklifin gonderildi. Haberdar olacaklar.`,
        ok: "Tamam",
      };

  const handleOfferHelp = () => {
    if (hasOfferedHelp) {
      Alert.alert(
        alertMessages.alreadyTitle,
        alertMessages.alreadyBody,
        [{ text: alertMessages.ok }]
      );
      return;
    }
    setHasOfferedHelp(true);
    Alert.alert(
      alertMessages.successTitle,
      alertMessages.successBody,
      [{ text: alertMessages.ok }]
    );
  };

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <View style={styles.posterInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isDark ? "#CC3333" : METUColors.maroon },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {request.posterInitials}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.posterName}>{request.posterName}</ThemedText>
            <ThemedText
              style={[styles.postTime, { color: theme.textSecondary }]}
            >
              {language === "en"
                ? `Posted ${postedTimeLabel}`
                : `${postedTimeLabel} once paylasildi`}
            </ThemedText>
          </View>
        </View>
        {request.urgent ? (
          <View style={styles.urgentBadge}>
            <Feather name="alert-circle" size={14} color="#FFFFFF" />
            <ThemedText style={styles.urgentText}>{t.urgent}</ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText type="h3" style={styles.title}>
        {localizedTitle}
      </ThemedText>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather
            name={getCategoryIcon()}
            size={16}
            color={isDark ? "#FF6B6B" : METUColors.maroon}
          />
          <ThemedText style={styles.categoryText}>{getCategoryLabel()}</ThemedText>
        </View>

        <View style={styles.locationBadge}>
          <Feather name="map-pin" size={16} color={theme.textSecondary} />
          <ThemedText
            style={[styles.locationText, { color: theme.textSecondary }]}
          >
            {localizedLocation}
          </ThemedText>
        </View>
      </View>

      <View
        style={[styles.descriptionCard, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedText style={styles.descriptionLabel}>
          {language === "en" ? "Details" : "Detaylar"}
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          {localizedDescription}
        </ThemedText>
      </View>

      <Pressable
        onPress={handleOfferHelp}
        style={({ pressed }) => [
          styles.helpButton,
          {
            backgroundColor: hasOfferedHelp
              ? theme.backgroundSecondary
              : METUColors.actionGreen,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather
          name={hasOfferedHelp ? "check" : "heart"}
          size={20}
          color={hasOfferedHelp ? theme.text : "#FFFFFF"}
        />
        <ThemedText
          style={[
            styles.helpButtonText,
            { color: hasOfferedHelp ? theme.text : "#FFFFFF" },
          ]}
        >
          {hasOfferedHelp
            ? language === "en"
              ? "Help Offered"
              : "Yardim bildirildi"
            : t.iCanHelp}
        </ThemedText>
      </Pressable>

      <View style={styles.contactNote}>
        <Feather name="info" size={16} color={theme.textSecondary} />
        <ThemedText
          style={[styles.contactNoteText, { color: theme.textSecondary }]}
        >
          {language === "en"
            ? "When you offer help, the poster will be notified and can contact you directly."
            : "Yardim teklif ettiginde paylasan kisi bilgilendirilir ve seninle dogrudan iletisime gecebilir."}
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  posterInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  posterName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
  },
  postTime: {
    fontSize: Typography.small.fontSize,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: METUColors.alertRed,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  urgentText: {
    color: "#FFFFFF",
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
  },
  title: {
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: Typography.small.fontSize,
    fontWeight: "500",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.small.fontSize,
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  descriptionLabel: {
    fontSize: Typography.small.fontSize,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  descriptionText: {
    fontSize: Typography.body.fontSize,
    lineHeight: 24,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  helpButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: "600",
  },
  contactNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: BorderRadius.md,
  },
  contactNoteText: {
    flex: 1,
    fontSize: Typography.small.fontSize,
    lineHeight: 20,
  },
  missingRequest: {
    marginTop: Spacing.xl,
    fontSize: Typography.body.fontSize,
    textAlign: "center",
  },
});
