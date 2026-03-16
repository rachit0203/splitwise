import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors } from "../utils/theme";

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const onSearch = async () => {
    const { data } = await API.get(
      `/api/users/search?q=${encodeURIComponent(query)}`,
    );
    setResults(data.users || []);
  };

  const onSendRequest = async (receiverId) => {
    try {
      await API.post("/api/friends/request", { receiverId });
      Alert.alert("Success", "Friend request sent");
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not send request",
      );
    }
  };

  return (
    <ScreenContainer>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or email"
        style={styles.input}
      />
      <PrimaryButton title="Search" onPress={onSearch} />

      {results.map((item) => (
        <View key={item._id} style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <PrimaryButton
            title="Send Request"
            onPress={() => onSendRequest(item._id)}
          />
        </View>
      ))}
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
  card: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  name: {
    fontWeight: "600",
    color: colors.text,
  },
  email: {
    color: colors.subtext,
  },
});
