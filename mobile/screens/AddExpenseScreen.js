import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

const splitTypes = ["equal", "unequal", "percentage", "exact"];

export default function AddExpenseScreen({ route, navigation }) {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [selectedParticipants, setSelectedParticipants] = useState({});
  const [allocationInput, setAllocationInput] = useState("");

  useEffect(() => {
    const loadGroup = async () => {
      const { data } = await API.get(`/api/groups/${groupId}`);
      const loadedGroup = data.group;
      setGroup(loadedGroup);
      setPaidBy(user._id);

      const initial = {};
      loadedGroup.members.forEach((member) => {
        initial[member._id] = true;
      });
      setSelectedParticipants(initial);
    };

    loadGroup();
  }, [groupId, user._id]);

  const selectedMemberIds = Object.keys(selectedParticipants).filter(
    (id) => selectedParticipants[id],
  );

  const buildParticipants = () => {
    if (splitType === "equal") {
      return selectedMemberIds.map((id) => ({ user: id }));
    }

    const values = allocationInput
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));

    if (values.length !== selectedMemberIds.length) {
      throw new Error("Allocation count must match selected participants");
    }

    return selectedMemberIds.map((id, index) => {
      if (splitType === "unequal") {
        return { user: id, share: values[index] };
      }
      if (splitType === "percentage") {
        return { user: id, percentage: values[index] };
      }
      return { user: id, exactAmount: values[index] };
    });
  };

  const onCreateExpense = async () => {
    try {
      const payload = {
        description,
        amount: Number(amount),
        paidBy,
        participants: buildParticipants(),
        splitType,
        groupId,
      };

      await API.post("/api/expenses/create", payload);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message ||
          error.message ||
          "Could not add expense",
      );
    }
  };

  if (!group) {
    return (
      <ScreenContainer>
        <Text style={styles.empty}>Loading group members...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Expense description"
        style={styles.input}
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.section}>Payer</Text>
      {group.members.map((member) => (
        <View key={member._id} style={styles.card}>
          <Text style={styles.name}>{member.name}</Text>
          <PrimaryButton
            title={paidBy === member._id ? "Selected" : "Select"}
            onPress={() => setPaidBy(member._id)}
            type={paidBy === member._id ? "secondary" : "primary"}
          />
        </View>
      ))}

      <Text style={styles.section}>Participants</Text>
      {group.members.map((member) => (
        <View key={member._id} style={styles.card}>
          <Text style={styles.name}>{member.name}</Text>
          <PrimaryButton
            title={selectedParticipants[member._id] ? "Included" : "Excluded"}
            type={selectedParticipants[member._id] ? "secondary" : "danger"}
            onPress={() =>
              setSelectedParticipants((prev) => ({
                ...prev,
                [member._id]: !prev[member._id],
              }))
            }
          />
        </View>
      ))}

      <Text style={styles.section}>Split Type</Text>
      {splitTypes.map((type) => (
        <PrimaryButton
          key={type}
          title={type}
          type={splitType === type ? "secondary" : "primary"}
          onPress={() => setSplitType(type)}
        />
      ))}

      {splitType !== "equal" ? (
        <TextInput
          value={allocationInput}
          onChangeText={setAllocationInput}
          placeholder="Comma values in selected member order"
          style={styles.input}
        />
      ) : null}

      <PrimaryButton title="Create Expense" onPress={onCreateExpense} />
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
    marginTop: 12,
    fontWeight: "600",
    color: colors.text,
    fontSize: 17,
  },
  card: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  empty: {
    color: colors.subtext,
  },
});
