import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { CommonActions } from "@react-navigation/native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import BrowseStackNavigator from "@/navigation/BrowseStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { METUColors } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  BrowseTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#FF6B6B" : METUColors.maroon,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={BrowseStackNavigator}
        options={{
          title: t.browse,
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Check if BrowseTab is stuck on AskQuestion (no other screens in stack)
            const state = navigation.getState();
            const browseTabRoute = state.routes.find((r) => r.name === "BrowseTab");
            const browseStackState = browseTabRoute?.state;
            
            // If AskQuestion is the only screen in the stack, reset to Browse
            if (
              browseStackState &&
              browseStackState.index === 0 &&
              browseStackState.routes.length === 1 &&
              browseStackState.routes[0].name === "AskQuestion"
            ) {
              // Prevent default tab press behavior
              e.preventDefault();
              // Reset the BrowseTab stack to show Browse screen
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "BrowseTab",
                      state: {
                        routes: [{ name: "Browse", params: { initialTab: "questions" } }],
                      },
                    },
                  ],
                })
              );
            }
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t.profile,
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
