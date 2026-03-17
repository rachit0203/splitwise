import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "../../theme";

export default function ProgressBar({ progress = 0, tint = colors.accent }) {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: tint,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
