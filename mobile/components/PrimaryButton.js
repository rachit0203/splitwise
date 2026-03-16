import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "../utils/theme";

export default function PrimaryButton({ title, onPress, type = "primary" }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        type === "secondary" && styles.secondary,
        type === "danger" && styles.danger,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
