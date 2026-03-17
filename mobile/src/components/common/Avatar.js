import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, textStyles } from "../../theme";

export function getAvatarColor(id) {
  const safeId = String(id || "A");
  const index = safeId.charCodeAt(0) % colors.avatarPalette.length;
  return colors.avatarPalette[index] || colors.avatarPalette[0];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function Avatar({ name, id, size = 36 }) {
  const palette = useMemo(() => getAvatarColor(id || name || ""), [id, name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: palette.bg,
        },
      ]}
    >
      <Text style={[textStyles.bodyMd, { color: palette.text }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
