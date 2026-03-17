import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../theme";
import { formatBalance, formatINR } from "../utils/format";
import SectionTitle from "../components/common/SectionTitle";
import IconButton from "../components/common/IconButton";
import ExpenseItem from "../components/cards/ExpenseItem";
import Badge from "../components/common/Badge";
import Avatar from "../components/common/Avatar";
import SkeletonBlock from "../components/common/SkeletonBlock";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const FILTERS = ["All", "Food", "Travel", "Utilities", "Other"];

export default function GroupDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

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
    const total = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0,
    );
    const paid = expenses
      .filter((exp) => exp.paidBy?._id === user?._id)
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const net = paid - (total - paid);
    return { total, net };
  }, [expenses, user?._id]);

  const netDisplay = useMemo(() => formatBalance(summary.net), [summary.net]);

  const filteredExpenses = useMemo(() => {
    if (activeFilter === "All") return expenses;
    return expenses.filter((exp) => exp.category === activeFilter);
  }, [activeFilter, expenses]);

  const nonMembers = useMemo(() => {
    if (!group) return [];
    return friends.filter(
      (friend) =>
        !(group.members || []).some((m) => (m._id || m) === friend._id),
    );
  }, [friends, group]);

  const renderNonMember = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => handleAddMember(item._id)}
        style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
      >
        <Avatar name={item.name} id={item._id} size={36} />
        <Text style={textStyles.bodyMd}>{item.name}</Text>
        <Text style={[textStyles.tiny, { color: colors.accent }]}>Add</Text>
      </Pressable>
    ),
    [handleAddMember],
  );

  const handleAddMember = useCallback(
    async (memberId) => {
      try {
        await API.post("/api/groups/add-member", { groupId, memberId });
        await loadData();
      } catch (error) {
        console.warn(
          "Add member error:",
          error?.response?.data?.message || error.message,
        );
      }
    },
    [groupId, loadData],
  );

  const expenseItems = useMemo(() => {
    return filteredExpenses.map((expense) => {
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
  }, [filteredExpenses, user?._id]);

  const memberItems = useMemo(() => group?.members || [], [group]);

  const renderMemberItem = useCallback(
    ({ item }) => (
      <View style={styles.memberChip}>
        <Avatar name={item.name} id={item._id} size={32} />
        <Text style={textStyles.small}>{item.name?.split(" ")[0]}</Text>
      </View>
    ),
    [],
  );

  const renderExpenseItem = useCallback(
    ({ item }) => <ExpenseItem item={item} onPress={item.onPress} />,
    [],
  );

  if (!group) {
    return (
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.screenV,
            paddingHorizontal: spacing.screenH,
          },
        ]}
      >
        <SkeletonBlock style={styles.skeletonHeader} />
        <SkeletonBlock style={styles.skeletonCard} />
        <SkeletonBlock style={styles.skeletonRow} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={expenseItems}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        ListHeaderComponent={
          <View
            style={{
              paddingTop: insets.top + spacing.screenV,
              paddingBottom: spacing.gap,
            }}
          >
            <View style={styles.headerRow}>
              <IconButton onPress={() => navigation.goBack()}>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.textSecondary}
                />
              </IconButton>
              <View style={styles.headerTitle}>
                <Text style={textStyles.h2}>{group.name}</Text>
                <Badge
                  variant="pending"
                  label={`${group.members?.length || 0} members`}
                />
              </View>
              <View style={{ width: 36 }} />
            </View>

            <View style={styles.heroRow}>
              <View>
                <Text style={textStyles.label}>Total spend</Text>
                <Text style={textStyles.h2}>{formatINR(summary.total)}</Text>
              </View>
              <View style={styles.netChip}>
                <Text style={textStyles.tiny}>Your net</Text>
                <Text style={[textStyles.bodyMd, { color: netDisplay.color }]}>
                  {netDisplay.text}
                </Text>
              </View>
            </View>

            <View style={styles.filters}>
              {FILTERS.map((filter) => {
                const active = filter === activeFilter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[styles.filterPill, active && styles.filterActive]}
                  >
                    <Text
                      style={[
                        textStyles.tiny,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle>Members</SectionTitle>
            <FlatList
              data={memberItems}
              keyExtractor={(item) => item._id || item}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderMemberItem}
            />

            {nonMembers.length > 0 ? (
              <View style={styles.addSection}>
                <SectionTitle>Add member</SectionTitle>
                <FlatList
                  data={nonMembers}
                  keyExtractor={(item) => item._id}
                  renderItem={renderNonMember}
                  scrollEnabled={false}
                />
              </View>
            ) : null}

            <SectionTitle>Expenses</SectionTitle>
            {expenseItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[textStyles.bodyMd, styles.emptyIcon]}>🧾</Text>
                <Text style={textStyles.h3}>No expenses in this group</Text>
                <Pressable
                  onPress={() => navigation.navigate("AddExpense", { groupId })}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Add expense</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              onPress={() => navigation.navigate("AddExpense", { groupId })}
              style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.fabLabel}>Add Expense</Text>
            </Pressable>
          </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.gap,
  },
  headerTitle: {
    alignItems: "center",
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.gap,
  },
  netChip: {
    backgroundColor: colors.bgSurface2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.itemGap,
    marginBottom: spacing.gap,
  },
  filterPill: {
    backgroundColor: colors.bgSurface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.gap,
    paddingVertical: spacing.sm,
  },
  filterActive: {
    backgroundColor: colors.accent,
  },
  filterTextActive: {
    color: colors.white,
  },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
    padding: spacing.itemGap,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.itemGap,
  },
  addSection: {
    marginTop: spacing.gap,
    gap: spacing.itemGap,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.itemGap,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
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
  skeletonHeader: {
    height: 48,
    borderRadius: radius.lg,
    marginBottom: spacing.gap,
  },
  skeletonCard: {
    height: 120,
    borderRadius: radius.xl,
    marginBottom: spacing.gap,
  },
  skeletonRow: {
    height: 80,
    borderRadius: radius.xl,
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
  footer: {
    paddingTop: spacing.gap,
    alignItems: "flex-end",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
  },
  fabLabel: {
    ...textStyles.bodyMd,
    color: colors.white,
  },
});
