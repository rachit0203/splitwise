import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors } from "../utils/theme";

export default function CreateGroupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const loadFriends = async () => {
      const { data } = await API.get("/api/friends/list");
      setFriends(data.friends || []);
    };

    loadFriends();
  }, []);

  const toggleSelection = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onCreate = async () => {
    try {
      const members = Object.keys(selected).filter((id) => selected[id]);
      const { data } = await API.post("/api/groups/create", { name, members });
      navigation.replace("GroupDetails", { groupId: data.group._id });
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create group",
      );
    }
  };

  return (
    <ScreenContainer>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Group name"
        style={styles.input}
      />
      <Text style={styles.section}>Add Friends</Text>
      {friends.map((friend) => (
        <View key={friend._id} style={styles.card}>
          <Text style={styles.name}>{friend.name}</Text>
          <PrimaryButton
            title={selected[friend._id] ? "Selected" : "Select"}
            type={selected[friend._id] ? "secondary" : "primary"}
            onPress={() => toggleSelection(friend._id)}
          />
        </View>
      ))}
      <PrimaryButton title="Create Group" onPress={onCreate} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
  },
  section: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  card: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: colors.text,
    fontWeight: "600",
  },
});
