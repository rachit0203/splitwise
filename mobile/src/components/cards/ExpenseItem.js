import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";

function ExpenseItem({ item, onPress }) {
  const amountStyle = item.isPositive
    ? { color: colors.success }
    : { color: colors.danger };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Text style={textStyles.h3}>{item.emoji || "🍽️"}</Text>
      </View>
      <View style={styles.center}>
        <Text style={textStyles.bodyMd} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={textStyles.small}>{item.subtitle}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[textStyles.bodyMd, amountStyle]}>{item.amountText}</Text>
        <Text style={textStyles.tiny}>{item.detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.rowPad,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.itemGap,
  },
  center: {
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
    marginLeft: spacing.itemGap,
  },
});

export default React.memo(ExpenseItem);
