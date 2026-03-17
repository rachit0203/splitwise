import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors, radius } from "../../theme";

export default function IconButton({ children, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
