import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SignUp } from "@clerk/clerk-expo/web";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../src/theme";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.screenV }]}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={26} color={colors.white} />
          </View>
          <Text style={textStyles.h1}>Create account</Text>
          <Text style={[textStyles.small, styles.tagline]}>
            Join and start splitting expenses
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.clerkWrap}>
            <SignUp />
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
  tagline: {
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clerkWrap: {
    marginTop: spacing.itemGap,
  },
});
