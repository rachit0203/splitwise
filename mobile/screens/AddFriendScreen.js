import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors, fontSize, spacing } from "../utils/theme";

export default function AddFriendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const onSearch = async () => {
    if (!query.trim()) return;
    try {
      setSearching(true);
      const { data } = await API.get(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      setResults(data.users || []);
    } catch (e) {
      console.warn("Search error:", e.message);
    } finally {
      setSearching(false);
    }
  };

  const onSendRequest = async (receiverId) => {
    try {
      await API.post("/api/friends/request", { receiverId });
      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not send request",
      );
    }
  };

  return (
    <ScreenContainer>
      <Input
        icon="search"
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or email"
      />
      <PrimaryButton
        title={searching ? "Searching..." : "Search"}
        icon="search"
        onPress={onSearch}
        disabled={searching}
      />

      {results.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Results ({results.length})
          </Text>
          {results.map((item) => (
            <Card key={item._id}>
              <View style={styles.row}>
                <Avatar name={item.name} size={40} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <PrimaryButton
                  title="Add"
                  icon="person-add-outline"
                  compact
                  onPress={() => onSendRequest(item._id)}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.md },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: { fontWeight: "600", color: colors.text, fontSize: fontSize.md },
  email: { color: colors.subtext, fontSize: fontSize.sm, marginTop: 2 },
});
