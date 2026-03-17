import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, borderRadius, spacing, shadow } from "../utils/theme";

export default function Card({ children, onPress, style }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      style={({ pressed } = {}) => [
        styles.card,
        onPress && pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </Wrapper>
  );
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
