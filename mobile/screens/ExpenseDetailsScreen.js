import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors, fontSize, spacing } from "../utils/theme";

export default function ExpenseDetailsScreen({ route, navigation }) {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const { data: groupsData } = await API.get("/api/groups/my");
        for (const group of groupsData.groups || []) {
          const { data } = await API.get(`/api/expenses/group/${group._id}`);
          const found = (data.expenses || []).find((item) => item._id === expenseId);
          if (found) {
            setExpense(found);
            setDescription(found.description);
            setAmount(String(found.amount));
            return;
          }
        }
      } catch (e) {
        console.warn("Load expense error:", e.message);
      }
    };
    loadExpense();
  }, [expenseId]);

  const onUpdate = async () => {
    if (!expense) return;
    try {
      setSaving(true);
      await API.put(`/api/expenses/${expense._id}`, {
        description,
        amount: Number(amount),
        splitType: expense.splitType,
        participants: expense.participants.map((p) => ({
          user: p.user._id || p.user,
          share: p.share,
          percentage: p.percentage,
          exactAmount: p.exactAmount,
        })),
      });
      Alert.alert("Success", "Expense updated");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not update expense",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!expense) return;
    Alert.alert("Delete Expense", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/api/expenses/${expense._id}`);
            Alert.alert("Deleted", "Expense deleted");
            navigation.goBack();
          } catch (error) {
            Alert.alert(
              "Failed",
              error?.response?.data?.message || "Could not delete expense",
            );
          }
        },
      },
    ]);
  };

  if (!expense) {
    return (
      <ScreenContainer>
        <Text style={styles.loading}>Loading expense...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Card>
        <View style={styles.headerRow}>
          <View style={styles.expenseIcon}>
            <Ionicons name="receipt" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.amount}>₹{Number(expense.amount).toFixed(2)}</Text>
            <Text style={styles.meta}>
              Paid by {expense.paidBy?.name} · {expense.splitType} split
            </Text>
          </View>
        </View>
      </Card>

      <Input
        label="Description"
        icon="document-text-outline"
        value={description}
        onChangeText={setDescription}
        placeholder="Expense description"
      />
      <Input
        label="Amount (₹)"
        icon="cash-outline"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />

      {/* Participants */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="people-outline" size={16} color={colors.primary} />
        {"  "}Participants
      </Text>
      {expense.participants.map((p) => (
        <Card key={p.user?._id || p.user}>
          <View style={styles.participantRow}>
            <Ionicons name="person-outline" size={18} color={colors.subtext} />
            <Text style={styles.participantName}>
              {p.user?.name || "Unknown"}
            </Text>
            <Text style={styles.share}>
              {expense.splitType === "percentage"
                ? `${p.percentage}%`
                : `₹${(p.share || p.exactAmount || 0).toFixed(2)}`}
            </Text>
          </View>
        </Card>
      ))}

      <View style={styles.actions}>
        <PrimaryButton
          title={saving ? "Saving..." : "Save Changes"}
          icon="checkmark-circle-outline"
          onPress={onUpdate}
          disabled={saving}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton
          title="Delete Expense"
          type="danger"
          icon="trash-outline"
          onPress={onDelete}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  participantName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
  },
  share: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: fontSize.md,
  },
  actions: {
    marginTop: spacing.xl,
  },
  loading: {
    color: colors.subtext,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
