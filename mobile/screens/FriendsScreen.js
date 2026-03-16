import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors } from "../utils/theme";

export default function FriendsScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);

  const loadFriends = useCallback(async () => {
    const { data } = await API.get("/api/friends/list");
    setFriends(data.friends || []);
    setPendingReceived(data.pendingReceived || []);
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

  return (
    <ScreenContainer>
      <PrimaryButton
        title="Add Friend"
        onPress={() => navigation.navigate("AddFriend")}
      />

      <Text style={styles.section}>Pending Requests</Text>
      {pendingReceived.length === 0 ? (
        <Text style={styles.empty}>No pending requests</Text>
      ) : null}
      {pendingReceived.map((request) => (
        <View key={request._id} style={styles.card}>
          <Text style={styles.name}>{request.sender?.name}</Text>
          <Text style={styles.email}>{request.sender?.email}</Text>
          <View style={styles.row}>
            <View style={styles.grow}>
              <PrimaryButton
                title="Accept"
                onPress={() => onProcess(request._id, "accept")}
              />
            </View>
            <View style={styles.grow}>
              <PrimaryButton
                title="Reject"
                type="danger"
                onPress={() => onProcess(request._id, "reject")}
              />
            </View>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Friends</Text>
      {friends.length === 0 ? (
        <Text style={styles.empty}>No friends yet</Text>
      ) : null}
      {friends.map((friend) => (
        <View key={friend._id} style={styles.card}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.email}>{friend.email}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  card: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  email: {
    color: colors.subtext,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  grow: {
    flex: 1,
  },
  empty: {
    color: colors.subtext,
    marginTop: 8,
  },
});
