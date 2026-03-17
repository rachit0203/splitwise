import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import FloatingButton from "../components/FloatingButton";
import API from "../services/api";
import { colors, fontSize, spacing, borderRadius } from "../utils/theme";

export default function GroupListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      const { data } = await API.get("/api/groups/my");
      setGroups(data.groups || []);
    } catch (e) {
      console.warn("Load groups error:", e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  const filtered = groups.filter(
    (g) => !search || g.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenContainer>
        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.subtext} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <Text style={styles.empty}>
              {search ? "No matching groups" : "No groups yet"}
            </Text>
          </View>
        ) : null}

        {filtered.map((group) => (
          <Card
            key={group._id}
            onPress={() =>
              navigation.navigate("GroupDetails", { groupId: group._id })
            }
          >
            <View style={styles.groupRow}>
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={22} color={colors.secondary} />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>
                  {group.members?.length || 0} members
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.subtext}
              />
            </View>
          </Card>
        ))}
      </ScreenContainer>

      <FloatingButton
        icon="add"
        onPress={() => navigation.navigate("CreateGroup")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  empty: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  groupInfo: { flex: 1 },
  groupName: {
    fontWeight: "600",
    color: colors.text,
    fontSize: fontSize.md,
  },
  groupMeta: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
});
