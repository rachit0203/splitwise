import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, borderRadius, spacing, shadow } from "../utils/theme";

export default function Card({ children, onPress, style }) {
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
