import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";

const badgeStyles = {
  owe: { bg: colors.dangerDim, text: colors.danger },
  owed: { bg: colors.successDim, text: colors.success },
  settled: { bg: colors.settledDim, text: colors.textSecondary },
  pending: { bg: colors.warningDim, text: colors.warning },
};

export default function Badge({ variant = "settled", label }) {
  const style = badgeStyles[variant] || badgeStyles.settled;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[textStyles.tiny, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
});
