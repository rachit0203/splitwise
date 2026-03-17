import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";

export default function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 0.5,
    backgroundColor: colors.borderSubtle,
    width: "100%",
  },
});
