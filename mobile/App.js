import "react-native-gesture-handler";
import React from "react";
import { Platform, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { DMMono_400Regular } from "@expo-google-fonts/dm-mono";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./context/AuthContext";
import { colors } from "./src/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

console.log("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:", publishableKey);

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env — get it from clerk.com/dashboard",
  );
}

// Token cache using expo-secure-store (native) or localStorage (web)
const tokenCache = {
  async getToken(key) {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* ignore */
    }
  },
  async clearToken(key) {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans: DMSans_600SemiBold,
    DMSans_Mono: DMMono_400Regular,
  });

  const canRender = fontsLoaded || fontError || Platform.OS === "web";

  if (!canRender) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bgBase,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
