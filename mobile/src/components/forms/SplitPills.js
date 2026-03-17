import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";

export default function SplitPills({ options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[textStyles.tiny, active && styles.pillTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.itemGap,
  },
  pill: {
    paddingHorizontal: spacing.gap,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface2,
  },
  pillActive: {
    backgroundColor: colors.accent,
  },
  pillTextActive: {
    color: colors.white,
  },
});
