import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../theme";
import { formatINR } from "../utils/format";
import BalanceCard from "../components/cards/BalanceCard";
import ActivityItem from "../components/cards/ActivityItem";
import SectionTitle from "../components/common/SectionTitle";
import Avatar from "../components/common/Avatar";
import SkeletonBlock from "../components/common/SkeletonBlock";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function QuickAction({ icon, label, tint, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View style={[styles.quickIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={textStyles.tiny}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalBalance: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
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

      const groupList = groupsRes.data.groups || [];
      setGroups(groupList);

      const expenseResults = await Promise.all(
        groupList
          .slice(0, 4)
          .map((g) => API.get(`/api/expenses/group/${g._id}`)),
      );

      const flattened = expenseResults
        .flatMap((r) => r.data.expenses || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      setRecentExpenses(flattened);
    } catch (e) {
      console.warn("Dashboard load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const firstGroupId = groups[0]?._id;

  const handleAddExpense = useCallback(() => {
    if (firstGroupId) {
      navigation.navigate("AddExpense", { groupId: firstGroupId });
    } else {
      navigation.navigate("Groups");
    }
  }, [firstGroupId, navigation]);

  const handleSettleUp = useCallback(() => {
    navigation.navigate("SettleUp");
  }, [navigation]);

  const handleNewGroup = useCallback(() => {
    navigation.navigate("Groups");
  }, [navigation]);

  const handleReports = useCallback(() => {
    navigation.navigate("Activity");
  }, [navigation]);

  const activityData = useMemo(() => {
    return recentExpenses.map((expense) => {
      const isPositive = expense.paidBy?._id === user?._id;
      const groupName = expense.group?.name || "Group";
      const date = expense.createdAt
        ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })
        : "";
      const subtitle = `${groupName} · ${date}`;

      return {
        id: expense._id,
        title: expense.description,
        subtitle,
        amountText: formatINR(Number(expense.amount || 0)),
        detail: isPositive ? "you get back" : "you owe",
        isPositive,
        emoji: "🧾",
        tint: isPositive ? colors.successDim : colors.dangerDim,
        groupId: expense.group?._id,
      };
    });
  }, [recentExpenses, user?._id]);

  const handleActivityPress = useCallback(
    (groupId) => {
      if (groupId) {
        navigation.navigate("GroupDetail", { groupId });
      }
    },
    [navigation],
  );

  const activityItems = useMemo(() => {
    return activityData.map((item) => ({
      ...item,
      onPress: () => handleActivityPress(item.groupId),
    }));
  }, [activityData, handleActivityPress]);

  const renderActivityItem = useCallback(
    ({ item, index }) => (
      <ActivityItem
        item={item}
        onPress={item.onPress}
        isLast={index === activityItems.length - 1}
      />
    ),
    [activityItems.length],
  );

  const listHeader = useMemo(
    () => (
      <View
        style={[
          styles.headerWrap,
          { paddingTop: insets.top + spacing.screenV },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={textStyles.h2}>Hi, {user?.name || "there"}</Text>
            <Text style={textStyles.small}>Here is your expense summary</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Profile")}>
            <Avatar name={user?.name} id={user?._id} size={36} />
          </Pressable>
        </View>

        {loading ? (
          <SkeletonBlock style={styles.skeletonCard} />
        ) : (
          <BalanceCard
            totalBalance={summary.totalBalance}
            youOwe={summary.youOwe}
            youAreOwed={summary.youAreOwed}
          />
        )}

        <SectionTitle style={styles.sectionTitle}>Quick actions</SectionTitle>
        <View style={styles.quickRow}>
          <QuickAction
            icon="add"
            label="Add Expense"
            tint={colors.accentDim}
            onPress={handleAddExpense}
          />
          <QuickAction
            icon="swap-horizontal"
            label="Settle Up"
            tint={colors.successDim}
            onPress={handleSettleUp}
          />
          <QuickAction
            icon="people"
            label="New Group"
            tint={colors.warningDim}
            onPress={handleNewGroup}
          />
          <QuickAction
            icon="stats-chart"
            label="Reports"
            tint={colors.accentDim}
            onPress={handleReports}
          />
        </View>

        <SectionTitle style={styles.sectionTitle}>Recent activity</SectionTitle>
        {loading && <SkeletonBlock style={styles.skeletonRow} />}
      </View>
    ),
    [
      handleAddExpense,
      handleNewGroup,
      handleReports,
      handleSettleUp,
      insets.top,
      loading,
      navigation,
      summary.totalBalance,
      summary.youAreOwed,
      summary.youOwe,
      user?.name,
    ],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={activityItems}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !loading ? (
            <Text style={[textStyles.small, styles.empty]}>
              No activity yet
            </Text>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.screenH,
          paddingBottom: insets.bottom + spacing.screenV,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  headerWrap: {
    gap: spacing.gap,
    paddingBottom: spacing.gap,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    marginTop: spacing.gap,
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.itemGap,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: spacing.itemGap,
    gap: spacing.itemGap,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  skeletonCard: {
    height: 160,
    borderRadius: radius.card,
    backgroundColor: colors.bgSurface2,
    opacity: 0.6,
  },
  skeletonRow: {
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.bgSurface2,
    opacity: 0.6,
  },
  empty: {
    textAlign: "center",
    paddingVertical: spacing.gap,
    color: colors.textSecondary,
  },
});
