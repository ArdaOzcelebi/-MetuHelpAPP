import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import NeedHelpScreen from "@/screens/NeedHelpScreen";
import OfferHelpScreen from "@/screens/OfferHelpScreen";
import RequestDetailScreen from "@/screens/RequestDetailScreen";
import QuestionDetailScreen from "@/screens/QuestionDetailScreen";
import PostNeedScreen from "@/screens/PostNeedScreen";
import ChatScreen from "@/screens/ChatScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HomeStackParamList = {
  Home: undefined;
  NeedHelp: undefined;
  OfferHelp: undefined;
  RequestDetail: { requestId: string };
  QuestionDetail: { questionId: string };
  PostNeed: undefined;
  Chat: { chatId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="METU Help" />,
          headerRight: () => <LanguageToggle />,
        }}
      />
      <Stack.Screen
        name="NeedHelp"
        component={NeedHelpScreen}
        options={({ navigation }) => ({
          headerTitle: t.findHelp,
          headerRight: () => (
            <HeaderAddButton
              onPress={() => navigation.navigate("PostNeed")}
              accessibilityLabel="Post a need"
            />
          ),
        })}
      />
      <Stack.Screen
        name="OfferHelp"
        component={OfferHelpScreen}
        options={({ navigation }) => ({
          headerTitle: t.campusQA,
          headerRight: () => (
            <HeaderAddButton
              onPress={() => {
                // Navigate to Browse tab, then to AskQuestion
                const mainNavigation = navigation.getParent();
                if (mainNavigation) {
                  mainNavigation.navigate(
                    "BrowseTab" as never,
                    {
                      screen: "AskQuestion",
                    } as never,
                  );
                }
              }}
              icon="edit-2"
              accessibilityLabel="Ask a question"
            />
          ),
        })}
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
        name="PostNeed"
        component={PostNeedScreen}
        options={{
          headerTitle: t.postNeed,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerTitle: "Chat" }}
      />
    </Stack.Navigator>
  );
}
