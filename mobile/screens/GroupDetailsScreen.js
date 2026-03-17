import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import BalanceCard from "../components/BalanceCard";
import ExpenseCard from "../components/ExpenseCard";
import FloatingButton from "../components/FloatingButton";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../utils/theme";

export default function GroupDetailsScreen({ route, navigation }) {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [groupRes, expenseRes, friendRes] = await Promise.all([
        API.get(`/api/groups/${groupId}`),
        API.get(`/api/expenses/group/${groupId}`),
        API.get("/api/friends/list"),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expenseRes.data.expenses || []);
      setFriends(friendRes.data.friends || []);
    } catch (e) {
      console.warn("Load group error:", e.message);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const summary = useMemo(() => {
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const paid = expenses
      .filter((e) => e.paidBy?._id === user?._id)
      .reduce((s, e) => s + Number(e.amount), 0);
    return { total, paid, count: expenses.length };
  }, [expenses, user?._id]);

  const nonMembers = friends.filter(
    (f) => group && !group.members.some((m) => (m._id || m) === f._id),
  );

  const onAddMember = async (memberId) => {
    try {
      await API.post("/api/groups/add-member", { groupId, memberId });
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenContainer>
        {/* Group header */}
        <View style={styles.header}>
          <View style={styles.groupIcon}>
            <Ionicons name="people" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.memberCount}>
            {group.members?.length} members
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <BalanceCard
            label="Total Spent"
            value={`₹${summary.total.toFixed(0)}`}
            icon="cash-outline"
            tint={colors.primary}
          />
          <View style={{ width: spacing.sm }} />
          <BalanceCard
            label="You Paid"
            value={`₹${summary.paid.toFixed(0)}`}
            icon="card-outline"
            tint={colors.success}
          />
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          {"  "}Members
        </Text>
        <View style={styles.membersRow}>
          {(group.members || []).map((m) => (
            <View key={m._id} style={styles.memberChip}>
              <Avatar name={m.name} size={28} />
              <Text style={styles.memberName}>{m.name?.split(" ")[0]}</Text>
            </View>
          ))}
        </View>

        {/* Add Friends to Group */}
        {nonMembers.length > 0 ? (
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-add-outline" size={16} color={colors.secondary} />
              {"  "}Add Friend to Group
            </Text>
            {nonMembers.map((friend) => (
              <Card key={friend._id}>
                <View style={styles.friendRow}>
                  <Avatar name={friend.name} size={36} />
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <PrimaryButton
                    title="Add"
                    compact
                    type="secondary"
                    onPress={() => onAddMember(friend._id)}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {/* Expenses */}
        <Text style={styles.sectionTitle}>
          <Ionicons name="receipt-outline" size={16} color={colors.primary} />
          {"  "}Expenses ({summary.count})
        </Text>
        {expenses.length === 0 ? (
          <Text style={styles.empty}>No expenses in this group</Text>
        ) : null}
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            onPress={() =>
              navigation.navigate("ExpenseDetails", {
                expenseId: expense._id,
              })
            }
          />
        ))}
      </ScreenContainer>

      <FloatingButton
        onPress={() => navigation.navigate("AddExpense", { groupId })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
  },
  memberCount: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: "row",
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  membersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  memberName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  addSection: { marginTop: spacing.sm },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendName: {
    flex: 1,
    marginLeft: spacing.md,
    fontWeight: "500",
    color: colors.text,
    fontSize: fontSize.md,
  },
  empty: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
