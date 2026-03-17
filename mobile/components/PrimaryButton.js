import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing } from "../utils/theme";

export default function PrimaryButton({
  title,
  onPress,
  type = "primary",
  icon,
  disabled = false,
  compact = false,
}) {
  const bg =
    type === "secondary"
      ? colors.secondary
      : type === "danger"
        ? colors.danger
        : type === "outline"
          ? "transparent"
          : colors.primary;

  const textColor = type === "outline" ? colors.primary : "#ffffff";
  const borderColor = type === "outline" ? colors.primary : bg;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: bg, borderColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={textColor}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  compact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  icon: { marginRight: spacing.sm },
  label: { fontWeight: "600", fontSize: fontSize.md },
});
