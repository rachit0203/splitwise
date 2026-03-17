import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../utils/theme";

const splitTypes = ["equal", "unequal", "percentage", "exact"];
const splitIcons = {
  equal: "git-compare-outline",
  unequal: "bar-chart-outline",
  percentage: "pie-chart-outline",
  exact: "cash-outline",
};

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const { data } = await API.get(`/api/groups/${groupId}`);
        setGroup(data.group);
        setPaidBy(user._id);
        const initial = {};
        data.group.members.forEach((m) => {
          initial[m._id] = true;
        });
        setSelectedParticipants(initial);
      } catch (e) {
        console.warn("Load group error:", e.message);
      }
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
    return selectedMemberIds.map((id, i) => {
      if (splitType === "unequal") return { user: id, share: values[i] };
      if (splitType === "percentage") return { user: id, percentage: values[i] };
      return { user: id, exactAmount: values[i] };
    });
  };

  const onCreateExpense = async () => {
    if (!description.trim()) {
      Alert.alert("Missing", "Please enter a description");
      return;
    }
    const numAmount = Number(amount);
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount greater than 0");
      return;
    }
    if (selectedMemberIds.length === 0) {
      Alert.alert("No participants", "Select at least one participant");
      return;
    }
    try {
      setLoading(true);
      await API.post("/api/expenses/create", {
        description: description.trim(),
        amount: numAmount,
        paidBy,
        participants: buildParticipants(),
        splitType,
        groupId,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || error.message || "Could not add expense",
      );
    } finally {
      setLoading(false);
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
      <Input
        label="Description"
        icon="document-text-outline"
        value={description}
        onChangeText={setDescription}
        placeholder="What was the expense for?"
      />
      <Input
        label="Amount (₹)"
        icon="cash-outline"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />

      {/* Payer */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="person-outline" size={16} color={colors.primary} />
        {"  "}Paid By
      </Text>
      <View style={styles.chipRow}>
        {group.members.map((m) => (
          <Pressable
            key={m._id}
            style={[styles.chip, paidBy === m._id && styles.chipActive]}
            onPress={() => setPaidBy(m._id)}
          >
            <Avatar name={m.name} size={24} />
            <Text
              style={[
                styles.chipText,
                paidBy === m._id && styles.chipTextActive,
              ]}
            >
              {m.name?.split(" ")[0]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Participants */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="people-outline" size={16} color={colors.primary} />
        {"  "}Split Among
      </Text>
      <View style={styles.chipRow}>
        {group.members.map((m) => {
          const selected = selectedParticipants[m._id];
          return (
            <Pressable
              key={m._id}
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() =>
                setSelectedParticipants((prev) => ({
                  ...prev,
                  [m._id]: !prev[m._id],
                }))
              }
            >
              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={selected ? "#fff" : colors.subtext}
              />
              <Text
                style={[styles.chipText, selected && styles.chipTextActive]}
              >
                {m.name?.split(" ")[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Split Type */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="git-compare-outline" size={16} color={colors.primary} />
        {"  "}Split Type
      </Text>
      <View style={styles.chipRow}>
        {splitTypes.map((type) => (
          <Pressable
            key={type}
            style={[styles.chip, splitType === type && styles.chipActive]}
            onPress={() => setSplitType(type)}
          >
            <Ionicons
              name={splitIcons[type]}
              size={16}
              color={splitType === type ? "#fff" : colors.subtext}
            />
            <Text
              style={[
                styles.chipText,
                splitType === type && styles.chipTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {splitType !== "equal" ? (
        <Input
          label="Allocation Values"
          icon="create-outline"
          value={allocationInput}
          onChangeText={setAllocationInput}
          placeholder="Comma-separated values in member order"
        />
      ) : null}

      <View style={styles.createWrap}>
        <PrimaryButton
          title={loading ? "Creating..." : "Create Expense"}
          icon="add-circle-outline"
          onPress={onCreateExpense}
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
  },
  createWrap: {
    marginTop: spacing.xl,
  },
  empty: {
    color: colors.subtext,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
