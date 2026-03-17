import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors, fontSize, spacing, borderRadius } from "../utils/theme";

export default function FriendsScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [search, setSearch] = useState("");

  const loadFriends = useCallback(async () => {
    try {
      const { data } = await API.get("/api/friends/list");
      setFriends(data.friends || []);
      setPendingReceived(data.pendingReceived || []);
    } catch (e) {
      console.warn("Load friends error:", e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends]),
  );

  const onProcess = async (requestId, action) => {
    try {
      await API.post("/api/friends/accept", { requestId, action });
      await loadFriends();
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to process request",
      );
    }
  };

  const filtered = friends.filter(
    (f) =>
      !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScreenContainer>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.subtext} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search friends..."
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
        />
      </View>

      {/* Add Friend */}
      <PrimaryButton
        title="Add Friend"
        icon="person-add-outline"
        onPress={() => navigation.navigate("AddFriend")}
      />

      {/* Pending Requests */}
      {pendingReceived.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={16} color={colors.secondary} />
            {"  "}Pending Requests ({pendingReceived.length})
          </Text>
          {pendingReceived.map((request) => (
            <Card key={request._id}>
              <View style={styles.friendRow}>
                <Avatar name={request.sender?.name} size={40} />
                <View style={styles.friendInfo}>
                  <Text style={styles.name}>{request.sender?.name}</Text>
                  <Text style={styles.email}>{request.sender?.email}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title="Accept"
                    icon="checkmark"
                    compact
                    onPress={() => onProcess(request._id, "accept")}
                  />
                </View>
                <View style={{ width: spacing.sm }} />
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title="Reject"
                    type="danger"
                    icon="close"
                    compact
                    onPress={() => onProcess(request._id, "reject")}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {/* Friends List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          {"  "}Friends ({filtered.length})
        </Text>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>
            {search ? "No matching friends" : "No friends yet — add one!"}
          </Text>
        ) : null}
        {filtered.map((friend) => (
          <Card key={friend._id}>
            <View style={styles.friendRow}>
              <Avatar name={friend.name} size={40} />
              <View style={styles.friendInfo}>
                <Text style={styles.name}>{friend.name}</Text>
                <Text style={styles.email}>{friend.email}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
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
  section: { marginTop: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontWeight: "600",
    color: colors.text,
    fontSize: fontSize.md,
  },
  email: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  empty: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
