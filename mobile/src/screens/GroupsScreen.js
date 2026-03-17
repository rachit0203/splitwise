import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../theme";
import { formatINR } from "../utils/format";
import SectionTitle from "../components/common/SectionTitle";
import IconButton from "../components/common/IconButton";
import GroupCard from "../components/cards/GroupCard";
import ExpenseItem from "../components/cards/ExpenseItem";
import SkeletonBlock from "../components/common/SkeletonBlock";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function GroupsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [expensesByGroup, setExpensesByGroup] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/groups/my");
      const groupList = data.groups || [];
      setGroups(groupList);

      const expenseResults = await Promise.all(
        groupList.map((group) => API.get(`/api/expenses/group/${group._id}`)),
      );

      const expenseMap = {};
      groupList.forEach((group, index) => {
        expenseMap[group._id] = expenseResults[index].data.expenses || [];
      });
      setExpensesByGroup(expenseMap);
    } catch (e) {
      console.warn("Load groups error:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) => !search || g.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [groups, search]);

  const groupTotals = useMemo(() => {
    const totals = {};
    groups.forEach((group) => {
      const expenses = expensesByGroup[group._id] || [];
      totals[group._id] = expenses.reduce(
        (sum, exp) => sum + Number(exp.amount || 0),
        0,
      );
    });
    return totals;
  }, [groups, expensesByGroup]);

  const maxTotal = useMemo(() => {
    const values = Object.values(groupTotals);
    return values.length ? Math.max(...values) : 0;
  }, [groupTotals]);

  const groupCards = useMemo(() => {
    return filteredGroups.map((group) => {
      const expenses = expensesByGroup[group._id] || [];
      const total = groupTotals[group._id] || 0;
      const lastExpense = expenses[0];
      const lastText = lastExpense?.createdAt
        ? `Last: ${new Date(lastExpense.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
        : "Last: --";
      const balance =
        expenses
          .filter((exp) => exp.paidBy?._id === user?._id)
          .reduce((sum, exp) => sum + Number(exp.amount || 0), 0) -
        (total -
          expenses
            .filter((exp) => exp.paidBy?._id === user?._id)
            .reduce((sum, exp) => sum + Number(exp.amount || 0), 0));
      const progress = maxTotal ? total / maxTotal : 0;
      return {
        id: group._id,
        group: {
          name: group.name,
          memberCount: group.members?.length || 0,
          icon: "👥",
        },
        totalText: `Total: ${formatINR(total)}`,
        lastText,
        balance,
        progress,
      };
    });
  }, [expensesByGroup, filteredGroups, groupTotals, maxTotal, user?._id]);

  const handleGroupPress = useCallback(
    (groupId) => {
      navigation.navigate("GroupDetail", { groupId });
    },
    [navigation],
  );

  const groupCardData = useMemo(() => {
    return groupCards.map((card) => ({
      ...card,
      onPress: () => handleGroupPress(card.id),
    }));
  }, [groupCards, handleGroupPress]);

  const renderGroupCard = useCallback(({ item }) => {
    if (item.skeleton) {
      return <SkeletonBlock style={styles.skeletonCard} />;
    }
    return (
      <GroupCard
        group={item.group}
        totalText={item.totalText}
        lastText={item.lastText}
        balance={item.balance}
        progress={item.progress}
        onPress={item.onPress}
      />
    );
  }, []);

  const topGroupId = filteredGroups[0]?._id;
  const topGroupExpenses = expensesByGroup[topGroupId] || [];

  const expenseItems = useMemo(() => {
    return topGroupExpenses.slice(0, 6).map((expense) => {
      const isPositive = expense.paidBy?._id === user?._id;
      const share =
        Number(expense.amount || 0) / (expense.participants?.length || 1);
      const date = expense.createdAt
        ? new Date(expense.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })
        : "";
      return {
        id: expense._id,
        title: expense.description,
        subtitle: `Paid by ${expense.paidBy?.name || "--"} · ${date}`,
        amountText: `${isPositive ? "+" : "−"}${formatINR(share, 2)}`,
        detail: `your share: ${formatINR(share, 2)}`,
        isPositive,
        onPress: () => {},
      };
    });
  }, [topGroupExpenses, user?._id]);

  const renderExpenseItem = useCallback(
    ({ item }) => <ExpenseItem item={item} onPress={item.onPress} />,
    [],
  );

  const listData = loading
    ? [
        { id: "skeleton-1", skeleton: true },
        { id: "skeleton-2", skeleton: true },
      ]
    : groupCardData;

  return (
    <View style={styles.screen}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupCard}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + spacing.screenV }}>
            <View style={styles.headerRow}>
              <Text style={textStyles.h2}>Groups</Text>
              <IconButton onPress={() => navigation.navigate("CreateGroup")}>
                <Ionicons name="add" size={20} color={colors.textSecondary} />
              </IconButton>
            </View>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search groups"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={[textStyles.bodyMd, styles.emptyIcon]}>👥</Text>
              <Text style={textStyles.h3}>No groups yet</Text>
              <Pressable
                onPress={() => navigation.navigate("CreateGroup")}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>
                  Create your first group
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          topGroupId ? (
            <View style={styles.expenseSection}>
              <SectionTitle>Latest expenses</SectionTitle>
              {topGroupExpenses.length === 0 && !loading ? (
                <Text style={[textStyles.small, styles.empty]}>
                  No expenses in this group
                </Text>
              ) : (
                <FlatList
                  data={expenseItems}
                  keyExtractor={(item) => item.id}
                  renderItem={renderExpenseItem}
                  scrollEnabled={false}
                />
              )}
            </View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.gap,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.itemGap,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.itemGap,
    marginLeft: spacing.itemGap,
    ...textStyles.body,
  },
  expenseSection: {
    marginTop: spacing.gap,
    paddingBottom: spacing.gap,
  },
  skeletonCard: {
    height: 140,
    borderRadius: radius.xl,
    marginBottom: spacing.gap,
  },
  empty: {
    textAlign: "center",
    paddingVertical: spacing.gap,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.gap,
    gap: spacing.itemGap,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    ...textStyles.bodyMd,
    color: colors.white,
  },
});
