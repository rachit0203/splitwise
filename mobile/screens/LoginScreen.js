import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SignIn } from "@clerk/clerk-expo/web";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../src/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.screenV }]}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={28} color={colors.white} />
          </View>
          <Text style={textStyles.h1}>Splitwise</Text>
          <Text style={textStyles.small}>
            Manage shared expenses effortlessly
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={textStyles.h3}>Welcome back</Text>
          <View style={styles.clerkWrap}>
            <SignIn />
          </View>
        </View>
      </View>
      <View style={{ paddingBottom: insets.bottom + spacing.screenV }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgScreen,
    paddingHorizontal: spacing.screenH,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.gap,
  },
  logoWrap: {
    alignItems: "center",
    gap: spacing.itemGap,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.itemGap,
  },
  clerkWrap: {
    marginTop: spacing.itemGap,
  },
});
