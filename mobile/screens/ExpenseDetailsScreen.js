import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors } from "../utils/theme";

export default function ExpenseDetailsScreen({ route, navigation }) {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const loadExpense = async () => {
      const { data: groupsData } = await API.get("/api/groups/my");

      for (const group of groupsData.groups || []) {
        const { data } = await API.get(`/api/expenses/group/${group._id}`);
        const found = (data.expenses || []).find(
          (item) => item._id === expenseId,
        );
        if (found) {
          setExpense(found);
          setDescription(found.description);
          setAmount(String(found.amount));
          return;
        }
      }
    };

    loadExpense();
  }, [expenseId]);

  const onUpdate = async () => {
    if (!expense) {
      return;
    }

    try {
      const payload = {
        description,
        amount: Number(amount),
        splitType: expense.splitType,
        participants: expense.participants.map((participant) => ({
          user: participant.user._id || participant.user,
          share: participant.share,
          percentage: participant.percentage,
          exactAmount: participant.exactAmount,
        })),
      };

      await API.put(`/api/expenses/${expense._id}`, payload);
      Alert.alert("Success", "Expense updated");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not update expense",
      );
    }
  };

  const onDelete = async () => {
    if (!expense) {
      return;
    }

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
  };

  if (!expense) {
    return (
      <ScreenContainer>
        <Text style={styles.meta}>Loading expense...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.meta}>Paid by: {expense.paidBy?.name}</Text>
        <Text style={styles.meta}>Split: {expense.splitType}</Text>
      </View>

      <PrimaryButton title="Save Changes" onPress={onUpdate} />
      <PrimaryButton title="Delete Expense" type="danger" onPress={onDelete} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
  },
  meta: {
    color: colors.subtext,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
  },
});
