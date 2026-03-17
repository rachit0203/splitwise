import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { colors } from "../../theme";

export default function SkeletonBlock({ style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { opacity }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.bgSurface2,
  },
});
