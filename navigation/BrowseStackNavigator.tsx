import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BrowseScreen from "@/screens/BrowseScreen";
import RequestDetailScreen from "@/screens/RequestDetailScreen";
import QuestionDetailScreen from "@/screens/QuestionDetailScreen";
import AskQuestionScreen from "@/screens/AskQuestionScreen";
import PostNeedScreen from "@/screens/PostNeedScreen";
import { CreatePostButton } from "@/components/CreatePostButton";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type BrowseStackParamList = {
  Browse: { initialTab?: "needs" | "questions" } | undefined;
  RequestDetail: { requestId: string };
  QuestionDetail: { questionId: string };
  AskQuestion: undefined;
  PostNeed: undefined;
};

const Stack = createNativeStackNavigator<BrowseStackParamList>();

export default function BrowseStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          title: t.browse,
        }}
      />
      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{ headerTitle: t.requestDetails }}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AskQuestion"
        component={AskQuestionScreen}
        options={{
          headerTitle: t.askQuestion || "Ask Question",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="PostNeed"
        component={PostNeedScreen}
        options={{
          headerTitle: t.postNeed || "Post Need",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
