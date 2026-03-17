import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import { colors, borderRadius, fontSize, spacing, shadow } from "../utils/theme";

export default function ExpenseCard({ expense, onPress }) {
  const date = expense.createdAt
    ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="receipt-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {expense.description}
        </Text>
        <Text style={styles.meta}>
          Paid by {expense.paidBy?.name || "—"} · {expense.participants?.length || 0} split
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>₹{Number(expense.amount).toFixed(0)}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  pressed: { opacity: 0.9 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  center: { flex: 1 },
  title: { fontWeight: "600", color: colors.text, fontSize: fontSize.md },
  meta: { color: colors.subtext, fontSize: fontSize.sm, marginTop: 2 },
  right: { alignItems: "flex-end", marginLeft: spacing.sm },
  amount: { fontWeight: "700", color: colors.text, fontSize: fontSize.md },
  date: { color: colors.subtext, fontSize: fontSize.xs, marginTop: 2 },
});
