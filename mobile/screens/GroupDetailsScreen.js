import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

export default function GroupDetailsScreen({ route, navigation }) {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [memberIdToAdd, setMemberIdToAdd] = useState("");

  const loadData = useCallback(async () => {
    const [groupRes, expenseRes, friendRes] = await Promise.all([
      API.get(`/api/groups/${groupId}`),
      API.get(`/api/expenses/group/${groupId}`),
      API.get("/api/friends/list"),
    ]);

    setGroup(groupRes.data.group);
    setExpenses(expenseRes.data.expenses || []);
    setFriends(friendRes.data.friends || []);
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const summary = useMemo(() => {
    const total = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );
    const paid = expenses
      .filter((expense) => expense.paidBy?._id === user?._id)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return { total, paid, count: expenses.length };
  }, [expenses, user?._id]);

  const onAddMember = async () => {
    if (!memberIdToAdd) {
      return;
    }

    try {
      await API.post("/api/groups/add-member", {
        groupId,
        memberId: memberIdToAdd,
      });
      setMemberIdToAdd("");
      await loadData();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not add member",
      );
    }
  };

  if (!group) {
    return (
      <ScreenContainer>
        <Text style={styles.empty}>Loading group...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.meta}>
        Total spend: Rs {summary.total.toFixed(2)}
      </Text>
      <Text style={styles.meta}>Expense count: {summary.count}</Text>
      <Text style={styles.meta}>You paid: Rs {summary.paid.toFixed(2)}</Text>

      <PrimaryButton
        title="Add Expense"
        onPress={() => navigation.navigate("AddExpense", { groupId })}
      />

      <Text style={styles.section}>Add Friend To Group</Text>
      {friends.map((friend) => (
        <View key={friend._id} style={styles.friendRow}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <PrimaryButton
            title="Add"
            onPress={() => setMemberIdToAdd(friend._id)}
          />
        </View>
      ))}
      <TextInput
        value={memberIdToAdd}
        onChangeText={setMemberIdToAdd}
        placeholder="Selected friend id"
        style={styles.input}
      />
      <PrimaryButton
        title="Confirm Add Member"
        type="secondary"
        onPress={onAddMember}
      />

      <Text style={styles.section}>Expenses</Text>
      {expenses.map((expense) => (
        <View key={expense._id} style={styles.card}>
          <Text style={styles.expenseTitle}>{expense.description}</Text>
          <Text style={styles.meta}>
            Rs {Number(expense.amount).toFixed(2)}
          </Text>
          <Text style={styles.meta}>Paid by: {expense.paidBy?.name}</Text>
          <PrimaryButton
            title="View Details"
            onPress={() =>
              navigation.navigate("ExpenseDetails", { expenseId: expense._id })
            }
          />
        </View>
      ))}

      {expenses.length === 0 ? (
        <Text style={styles.empty}>No expenses in this group</Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  section: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  card: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  expenseTitle: {
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    color: colors.subtext,
  },
  empty: {
    color: colors.subtext,
    marginTop: 10,
  },
  friendRow: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendName: {
    color: colors.text,
    fontWeight: "600",
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
  },
});
