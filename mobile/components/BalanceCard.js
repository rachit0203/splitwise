import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing, shadow } from "../utils/theme";

export default function BalanceCard({ label, value, icon, iconColor, tint }) {
  return (
    <View style={[styles.card, { borderLeftColor: tint || colors.primary }]}>
      <View style={[styles.iconWrap, { backgroundColor: (tint || colors.primary) + "20" }]}>
        <Ionicons name={icon || "wallet-outline"} size={22} color={tint || colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: tint || colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    ...shadow.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: { color: colors.subtext, fontSize: fontSize.xs, marginBottom: 2 },
  value: { fontWeight: "700", fontSize: fontSize.lg },
});
