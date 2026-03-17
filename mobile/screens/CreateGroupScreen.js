import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { colors, fontSize, spacing } from "../utils/theme";

export default function CreateGroupScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState({});
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    const loadFriends = async () => {
      try {
        const { data } = await API.get("/api/friends/list");
        setFriends(data.friends || []);
      } catch (e) {
        console.warn("Load friends error:", e.message);
      }
      setLoaded(true);
    };
    loadFriends();
  }, []);

  const toggle = (id) => {
    setSelectedFriends((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert("Missing", "Please enter a group name");
      return;
    }
    try {
      setLoading(true);
      const members = Object.keys(selectedFriends).filter(
        (id) => selectedFriends[id],
      );
      await API.post("/api/groups/create", { name: name.trim(), members });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not create group",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Input
        label="Group Name"
        icon="people-outline"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Weekend Trip"
      />

      <Text style={styles.sectionTitle}>
        <Ionicons name="person-add-outline" size={16} color={colors.primary} />
        {"  "}Add Members
      </Text>

      {friends.map((friend) => {
        const selected = selectedFriends[friend._id];
        return (
          <Card key={friend._id} onPress={() => toggle(friend._id)}>
            <View style={styles.row}>
              <Avatar name={friend.name} size={36} />
              <Text style={styles.friendName}>{friend.name}</Text>
              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={selected ? colors.success : colors.border}
              />
            </View>
          </Card>
        );
      })}

      {loaded && friends.length === 0 ? (
        <Text style={styles.empty}>Add friends first to add them to groups</Text>
      ) : null}

      <View style={styles.createWrap}>
        <PrimaryButton
          title={loading ? "Creating..." : "Create Group"}
          icon="add-circle-outline"
          onPress={onCreateGroup}
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
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
    textAlign: "center",
    paddingVertical: spacing.lg,
    fontSize: fontSize.sm,
  },
  createWrap: {
    marginTop: spacing.xl,
  },
});
