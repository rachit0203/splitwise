import React from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing } from "../utils/theme";

export default function Input({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  editable,
  style,
}) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={colors.subtext}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
          multiline={multiline}
          editable={editable}
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            Platform.OS === "web" && { outlineStyle: "none" },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.sm },
  label: {
    color: colors.text,
    fontWeight: "600",
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  inputWithIcon: {},
});
