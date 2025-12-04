import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import NeedHelpScreen from "@/screens/NeedHelpScreen";
import OfferHelpScreen from "@/screens/OfferHelpScreen";
import RequestDetailScreen from "@/screens/RequestDetailScreen";
import PostNeedScreen from "@/screens/PostNeedScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HomeStackParamList = {
  Home: undefined;
  NeedHelp: undefined;
  OfferHelp: undefined;
  RequestDetail: { requestId: string };
  PostNeed: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

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
        }}
      />
      <Stack.Screen
        name="NeedHelp"
        component={NeedHelpScreen}
        options={{ headerTitle: "Find Help" }}
      />
      <Stack.Screen
        name="OfferHelp"
        component={OfferHelpScreen}
        options={{ headerTitle: "Campus Q&A" }}
      />
      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{ headerTitle: "Request Details" }}
      />
      <Stack.Screen
        name="PostNeed"
        component={PostNeedScreen}
        options={{
          headerTitle: "Post a Need",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
