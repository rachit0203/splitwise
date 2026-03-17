import React from "react";
import { Text } from "react-native";
import { textStyles } from "../../theme";

export default function SectionTitle({ children, style }) {
  return <Text style={[textStyles.sectionTitle, style]}>{children}</Text>;
}
