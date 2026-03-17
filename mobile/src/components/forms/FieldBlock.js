import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";

export default function FieldBlock({
  label,
  value,
  placeholder,
  onPress,
  rightSlot,
  style,
  editable = false,
  onChangeText,
  keyboardType,
}) {
  const display = value || placeholder;
  const isPlaceholder = !value;

  const Container = editable ? View : Pressable;
  const containerProps = editable ? {} : { onPress };

  return (
    <Container style={[styles.container, style]} {...containerProps}>
      <Text style={textStyles.label}>{label}</Text>
      <View style={styles.row}>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={keyboardType}
            style={styles.input}
          />
        ) : (
          <Text
            style={[textStyles.bodyMd, isPlaceholder && styles.placeholder]}
            numberOfLines={1}
          >
            {display}
          </Text>
        )}
        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingVertical: spacing.fieldPadV,
    paddingHorizontal: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.itemGap,
  },
  input: {
    flex: 1,
    ...textStyles.bodyMd,
    color: colors.textPrimary,
  },
  right: {
    marginLeft: spacing.itemGap,
  },
  placeholder: {
    color: colors.textMuted,
  },
});
