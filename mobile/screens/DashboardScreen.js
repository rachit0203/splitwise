import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import BalanceCard from "../components/BalanceCard";
import ExpenseCard from "../components/ExpenseCard";
import FloatingButton from "../components/FloatingButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing } from "../utils/theme";

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [simplified, setSimplified] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [firstGroupId, setFirstGroupId] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!user?._id) return;

    try {
      const [balanceRes, groupsRes] = await Promise.all([
        API.get(`/api/balances/user/${user._id}`),
        API.get("/api/groups/my"),
      ]);

      const s = balanceRes.data.summary || {};
      setSummary({
        totalBalance: Number(s.totalBalance) || 0,
        youOwe: Number(s.youOwe) || 0,
        youAreOwed: Number(s.youAreOwed) || 0,
      });
      setSimplified(balanceRes.data.simplified || []);

      const groups = groupsRes.data.groups || [];
      if (groups.length > 0) setFirstGroupId(groups[0]._id);

      const expenseResults = await Promise.all(
        groups.slice(0, 4).map((g) => API.get(`/api/expenses/group/${g._id}`)),
      );

      const flattened = expenseResults
        .flatMap((r) => r.data.expenses || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      setRecentExpenses(flattened);
    } catch (e) {
      console.warn("Dashboard load error:", e.message);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenContainer>
        {/* Greeting */}
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name} 👋</Text>
            <Text style={styles.greetSub}>Here's your expense summary</Text>
          </View>
        </View>

        {/* Balance Cards */}
        <View style={styles.cardRow}>
          <BalanceCard
            label="Total Balance"
            value={`₹${summary.totalBalance.toFixed(0)}`}
            icon="wallet-outline"
            tint={colors.primary}
          />
        </View>
        <View style={styles.cardRow}>
          <BalanceCard
            label="You Owe"
            value={`₹${summary.youOwe.toFixed(0)}`}
            icon="arrow-up-circle-outline"
            tint={colors.danger}
          />
          <View style={{ width: spacing.sm }} />
          <BalanceCard
            label="You Are Owed"
            value={`₹${summary.youAreOwed.toFixed(0)}`}
            icon="arrow-down-circle-outline"
            tint={colors.success}
          />
        </View>

        {/* Who owes whom */}
        {simplified.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
              {"  "}Who Owes Whom
            </Text>
            {simplified.map((line, idx) => (
              <Text key={`simplified-${idx}`} style={styles.simplifiedLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Recent Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
            {"  "}Recent Expenses
          </Text>

          {recentExpenses.length === 0 ? (
            <Text style={styles.empty}>No expenses yet — add one!</Text>
          ) : (
            recentExpenses.map((item) => (
              <ExpenseCard
                key={item._id}
                expense={item}
                onPress={() =>
                  navigation.navigate("ExpenseDetails", {
                    expenseId: item._id,
                  })
                }
              />
            ))
          )}
        </View>
      </ScreenContainer>

      {firstGroupId ? (
        <FloatingButton
          onPress={() =>
            navigation.navigate("AddExpense", { groupId: firstGroupId })
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  greetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
  },
  greetSub: {
    fontSize: fontSize.sm,
    color: colors.subtext,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  simplifiedLine: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary + "40",
    marginBottom: spacing.xs,
  },
  empty: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
