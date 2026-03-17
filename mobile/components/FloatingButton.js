import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow } from "../utils/theme";

export default function FloatingButton({ onPress, icon = "add", size = 56 }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={26} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
});
