import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, textStyles } from "../../theme";
import { formatBalance, formatINR } from "../../utils/format";

export default function BalanceCard({
  totalBalance = 0,
  youOwe = 0,
  youAreOwed = 0,
}) {
  const balance = useMemo(() => formatBalance(totalBalance), [totalBalance]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={textStyles.label}>Total balance</Text>
      <Text style={[textStyles.cardAmount, { color: balance.color }]}>
        {balance.text}
      </Text>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>You are owed</Text>
          <Text style={styles.chipValue}>{formatINR(youAreOwed)}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>You owe</Text>
          <Text style={styles.chipValue}>{formatINR(youOwe)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.cardPad,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.itemGap,
    marginTop: spacing.gap,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.chipBg,
    borderRadius: radius.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipLabel: {
    ...textStyles.tiny,
    color: colors.white,
  },
  chipValue: {
    ...textStyles.bodyMd,
    color: colors.white,
    marginTop: spacing.xs,
  },
});
