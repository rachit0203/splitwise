import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";
import { useCurrency } from "../../hooks/useCurrency";

export default function AmountInput({ value, onChange, placeholder = "0" }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const currency = useCurrency();
  const underline = useMemo(() => new Animated.Value(0), []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
    Animated.timing(underline, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [underline]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    Animated.timing(underline, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [underline]);

  return (
    <Pressable onPress={focusInput} style={styles.container}>
      <View style={styles.amountRow}>
        <Text style={[textStyles.bodyMd, styles.currency]}>{currency}</Text>
        <Text style={textStyles.bigAmount}>{value || placeholder}</Text>
      </View>
      <Animated.View style={[styles.underline, { opacity: underline }]} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        autoFocus
        style={styles.hiddenInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {!focused && value ? null : <View style={styles.spacer} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.gap,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.itemGap,
  },
  currency: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.accent,
  },
  underline: {
    width: "80%",
    height: 2,
    borderRadius: radius.underline,
    marginTop: spacing.itemGap,
    backgroundColor: colors.accent,
  },
  hiddenInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  spacer: {
    height: spacing.itemGap,
  },
});
