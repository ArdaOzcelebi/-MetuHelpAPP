import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import LoginScreen from "@/screens/Auth/LoginScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { RegistrationSuccessModal } from "@/src/components/RegistrationSuccessModal";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AuthStackContent() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const handleNavigateToLogin = () => {
    // @ts-ignore - navigation type
    navigation.navigate("Login");
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={getCommonScreenOptions({ theme, isDark })}
        initialRouteName="Login"
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      {/* Registration success modal - rendered here to have access to navigation */}
      <RegistrationSuccessModal onNavigateToLogin={handleNavigateToLogin} />
    </>
  );
}

export default function AuthStackNavigator() {
  return <AuthStackContent />;
}
