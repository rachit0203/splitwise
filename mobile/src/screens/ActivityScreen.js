import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../theme";
import { formatINR } from "../utils/format";
import ActivityItem from "../components/cards/ActivityItem";
import SectionTitle from "../components/common/SectionTitle";
import SkeletonBlock from "../components/common/SkeletonBlock";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ActivityScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const groupsRes = await API.get("/api/groups/my");
      const groupList = groupsRes.data.groups || [];
      const expenseResults = await Promise.all(
        groupList.map((g) => API.get(`/api/expenses/group/${g._id}`)),
      );
      const flattened = expenseResults
        .flatMap((r) => r.data.expenses || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setExpenses(flattened);
    } catch (e) {
      console.warn("Activity load error:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [loadActivity]),
  );

  const activityData = useMemo(() => {
    return expenses.map((expense) => {
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
  }, [expenses, user?._id]);

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

  return (
    <View style={styles.screen}>
      <FlatList
        data={activityItems}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityItem}
        ListHeaderComponent={
          <View
            style={{
              paddingTop: insets.top + spacing.screenV,
              paddingBottom: spacing.gap,
            }}
          >
            <Text style={textStyles.h2}>Activity</Text>
            <SectionTitle style={styles.subtitle}>Latest updates</SectionTitle>
            {loading && <SkeletonBlock style={styles.skeletonRow} />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={[textStyles.bodyMd, styles.emptyIcon]}>🕒</Text>
              <Text style={textStyles.h3}>No activity yet</Text>
              <Text style={textStyles.small}>
                Add an expense to get started
              </Text>
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
  subtitle: {
    marginTop: spacing.itemGap,
  },
  skeletonRow: {
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface2,
    opacity: 0.6,
    marginTop: spacing.gap,
  },
  empty: {
    textAlign: "center",
    paddingVertical: spacing.gap,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.gap,
  },
  emptyIcon: {
    fontSize: 48,
  },
});
