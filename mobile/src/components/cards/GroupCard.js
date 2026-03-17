import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, textStyles } from "../../theme";
import Badge from "../common/Badge";
import ProgressBar from "../common/ProgressBar";

function getBadgeVariant(balance) {
  if (balance === 0) return { variant: "settled", label: "Settled" };
  if (balance > 0) return { variant: "owed", label: "You are owed" };
  return { variant: "owe", label: "You owe" };
}

function GroupCard({
  group,
  totalText,
  lastText,
  balance = 0,
  progress = 0,
  onPress,
}) {
  const badge = getBadgeVariant(balance);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <Text style={textStyles.h3}>{group.icon || "👥"}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={textStyles.bodyMd} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={textStyles.small}>{group.memberCount} members</Text>
        </View>
        <Badge variant={badge.variant} label={badge.label} />
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar
          progress={progress}
          tint={badge.variant === "owe" ? colors.danger : colors.success}
        />
      </View>

      <View style={styles.footer}>
        <Text style={textStyles.small}>{totalText}</Text>
        <Text style={[textStyles.small, { color: colors.textMuted }]}>
          {lastText}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.gap,
  },
  pressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface2,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
  },
  progressWrap: {
    marginTop: spacing.itemGap,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.itemGap,
  },
});

export default React.memo(GroupCard);
