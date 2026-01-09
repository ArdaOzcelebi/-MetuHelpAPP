import React from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { ChatOverlayProvider, useChatOverlay } from "@/src/contexts/ChatOverlayContext";
import { ChatOverlay } from "@/src/components/ChatOverlay";
import { RegistrationModalProvider } from "@/src/contexts/RegistrationModalContext";

const NAVIGATION_KEYS = {
  AUTHENTICATED: "main",
  UNAUTHENTICATED: "auth",
} as const;

function AppContent() {
  const { user, loading } = useAuth();
  const { setCurrentRouteName } = useChatOverlay();

  console.log(
    "[AppContent] Rendering - user:",
    user ? "authenticated" : "null",
    "loading:",
    loading,
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  const navigationKey = user
    ? NAVIGATION_KEYS.AUTHENTICATED
    : NAVIGATION_KEYS.UNAUTHENTICATED;
  console.log("[AppContent] NavigationContainer key:", navigationKey);

  return (
    <>
      <NavigationContainer
        key={navigationKey}
        onStateChange={(state) => {
          // Get the current route name from navigation state
          if (state) {
            const getCurrentRouteName = (state: any): string | null => {
              if (!state || !state.routes) return null;
              const route = state.routes[state.index];
              if (route.state) {
                return getCurrentRouteName(route.state);
              }
              return route.name;
            };
            const routeName = getCurrentRouteName(state);
            setCurrentRouteName(routeName);
          }
        }}
      >
        {user ? <MainTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
      {/* Global chat overlay - always rendered but only visible when authenticated */}
      <ChatOverlay />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <RegistrationModalProvider>
            <ChatOverlayProvider>
              <SafeAreaProvider>
                <GestureHandlerRootView style={styles.root}>
                  <KeyboardProvider>
                    <AppContent />
                    <StatusBar style="auto" />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </ChatOverlayProvider>
          </RegistrationModalProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
