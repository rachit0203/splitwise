import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import StatCard from "../components/StatCard";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [simplified, setSimplified] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    const [balanceRes, groupsRes] = await Promise.all([
      API.get(`/api/balances/user/${user._id}`),
      API.get("/api/groups/my"),
    ]);

    setSummary(balanceRes.data.summary);
    setSimplified(balanceRes.data.simplified || []);

    const groups = groupsRes.data.groups || [];
    const expenseResults = await Promise.all(
      groups
        .slice(0, 4)
        .map((group) => API.get(`/api/expenses/group/${group._id}`)),
    );

    const flattened = expenseResults
      .flatMap((result) => result.data.expenses || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    setRecentExpenses(flattened);
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
    <ScreenContainer>
      <Text style={styles.heading}>Hi {user?.name}</Text>
      <StatCard
        label="Total Balance"
        value={`Rs ${summary.totalBalance.toFixed(2)}`}
      />
      <StatCard
        label="You Owe"
        value={`Rs ${summary.youOwe.toFixed(2)}`}
        tone="danger"
      />
      <StatCard
        label="You Are Owed"
        value={`Rs ${summary.youAreOwed.toFixed(2)}`}
        tone="success"
      />

      <View style={styles.row}>
        <PrimaryButton
          title="Friends"
          onPress={() => navigation.navigate("Friends")}
        />
      </View>
      <View style={styles.row}>
        <PrimaryButton
          title="Groups"
          type="secondary"
          onPress={() => navigation.navigate("Groups")}
        />
      </View>
      <View style={styles.row}>
        <PrimaryButton
          title="Settlement"
          onPress={() => navigation.navigate("Settlement")}
        />
      </View>
      <View style={styles.row}>
        <PrimaryButton title="Logout" type="danger" onPress={logout} />
      </View>

      <Text style={styles.section}>Who owes whom</Text>
      {simplified.length === 0 ? (
        <Text style={styles.empty}>No pending balances</Text>
      ) : null}
      {simplified.map((line) => (
        <Text key={line} style={styles.item}>
          {line}
        </Text>
      ))}

      <Text style={styles.section}>Recent Expenses</Text>
      <FlatList
        data={recentExpenses}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <Text style={styles.expenseTitle}>{item.description}</Text>
            <Text style={styles.expenseMeta}>
              Rs {Number(item.amount).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  row: {
    marginTop: 4,
  },
  section: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  item: {
    color: colors.subtext,
    marginTop: 4,
  },
  expenseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  expenseTitle: {
    fontWeight: "600",
    color: colors.text,
  },
  expenseMeta: {
    color: colors.subtext,
    marginTop: 2,
  },
  empty: {
    color: colors.subtext,
    marginTop: 8,
  },
});
