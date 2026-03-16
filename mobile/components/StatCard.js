import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../utils/theme";

export default function StatCard({ label, value, tone = "neutral" }) {
  const toneColor =
    tone === "danger"
      ? colors.danger
      : tone === "success"
        ? colors.success
        : colors.text;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: toneColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
});
