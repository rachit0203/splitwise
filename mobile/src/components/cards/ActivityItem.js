import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";

function ActivityItem({ item, onPress, isLast }) {
  const amountStyle = item.isPositive
    ? { color: colors.success }
    : { color: colors.danger };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
        !isLast && styles.divider,
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: item.tint || colors.accentDim },
        ]}
      >
        <Text style={textStyles.h3}>{item.emoji || "🧾"}</Text>
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
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  pressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
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

export default React.memo(ActivityItem);
