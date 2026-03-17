import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, borderRadius, fontSize } from "../utils/theme";

const palette = ["#c77dff", "#00b4d8", "#2a9d8f", "#e9c46a", "#e63946", "#9d4edd"];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function Avatar({ name, size = 40 }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const bg = getColor(name);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontWeight: "700" },
});
