import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForumScreen from "@/screens/ForumScreen";
import PostQuestionScreen from "@/screens/PostQuestionScreen";
import ForumQuestionDetailScreen from "@/screens/ForumQuestionDetailScreen";
import RequestDetailScreen from "@/screens/RequestDetailScreen";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type BrowseStackParamList = {
  Browse: undefined;
  RequestDetail: { requestId: string };
  QuestionDetail: { questionId: string };
  AskQuestion: undefined;
};

const Stack = createNativeStackNavigator<BrowseStackParamList>();

export default function BrowseStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Browse"
        component={ForumScreen}
        options={{
          title: "Q&A Forum",
        }}
      />
      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{ headerTitle: t.requestDetails }}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={ForumQuestionDetailScreen}
        options={{ headerTitle: "Question Details" }}
      />
      <Stack.Screen
        name="AskQuestion"
        component={PostQuestionScreen}
        options={{
          headerTitle: "",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
