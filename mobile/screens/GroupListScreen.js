import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { colors } from "../utils/theme";

export default function GroupListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);

  const loadGroups = useCallback(async () => {
    const { data } = await API.get("/api/groups/my");
    setGroups(data.groups || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [loadGroups]),
  );

  return (
    <ScreenContainer>
      <PrimaryButton
        title="Create Group"
        onPress={() => navigation.navigate("CreateGroup")}
      />
      {groups.length === 0 ? (
        <Text style={styles.empty}>No groups found</Text>
      ) : null}
      {groups.map((group) => (
        <View key={group._id} style={styles.card}>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.meta}>{group.members?.length || 0} members</Text>
          <PrimaryButton
            title="Open Group"
            onPress={() =>
              navigation.navigate("GroupDetails", { groupId: group._id })
            }
          />
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  name: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 16,
  },
  meta: {
    color: colors.subtext,
  },
  empty: {
    marginTop: 8,
    color: colors.subtext,
  },
});
