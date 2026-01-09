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
import { CreatePostButton } from "@/components/CreatePostButton";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/MainTabNavigator";
import type { BrowseStackParamList } from "@/navigation/BrowseStackNavigator";

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
            <CreatePostButton onPress={() => navigation.navigate("PostNeed")} />
          ),
        })}
      />
      <Stack.Screen
        name="OfferHelp"
        component={OfferHelpScreen}
        options={({ navigation }) => ({
          headerTitle: t.campusQA,
          headerRight: () => (
            <CreatePostButton
              icon="edit-2"
              onPress={() => {
                // Navigate to BrowseTab's AskQuestion screen
                const parentNav = navigation.getParent();
                if (parentNav) {
                  parentNav.navigate("BrowseTab", {
                    screen: "AskQuestion",
                  });
                }
              }}
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
