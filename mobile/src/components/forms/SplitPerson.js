import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";
import Avatar from "../common/Avatar";

export default function SplitPerson({
  name,
  share = 0,
  color = colors.accent,
}) {
  const progress = useRef(new Animated.Value(share / 100)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: share / 100,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [progress, share]);

  return (
    <View style={styles.row}>
      <Avatar name={name} size={34} />
      <View style={styles.center}>
        <Text style={textStyles.bodyMd}>{name}</Text>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: color,
                transform: [{ scaleX: progress }],
              },
            ]}
          />
        </View>
      </View>
      <Text style={textStyles.small}>{share}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
    paddingVertical: spacing.itemGap,
  },
  center: {
    flex: 1,
  },
  track: {
    height: 3,
    backgroundColor: colors.bgSurface2,
    borderRadius: radius.bar,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  fill: {
    height: "100%",
    borderRadius: radius.bar,
  },
});
