import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, textStyles } from "../theme";
import AmountInput from "../components/forms/AmountInput";
import FieldBlock from "../components/forms/FieldBlock";
import SplitPills from "../components/forms/SplitPills";
import SplitPerson from "../components/forms/SplitPerson";
import Avatar from "../components/common/Avatar";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../utils/format";

const SPLIT_OPTIONS = [
  { label: "Equal", value: "equal" },
  { label: "%", value: "percentage" },
  { label: "Custom", value: "custom" },
];

export default function AddExpenseScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitMode, setSplitMode] = useState("equal");
  const [selectedParticipants, setSelectedParticipants] = useState({});
  const [allocationInput, setAllocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const { data } = await API.get(`/api/groups/${groupId}`);
        setGroup(data.group);
        setPaidBy(user?._id || "");
        const initial = {};
        data.group.members.forEach((member) => {
          initial[member._id] = true;
        });
        setSelectedParticipants(initial);
      } catch (e) {
        console.warn("Load group error:", e.message);
      }
    };
    loadGroup();
  }, [groupId, user?._id]);

  const selectedMemberIds = useMemo(
    () =>
      Object.keys(selectedParticipants).filter(
        (id) => selectedParticipants[id],
      ),
    [selectedParticipants],
  );

  const allocationValues = useMemo(() => {
    return allocationInput
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));
  }, [allocationInput]);

  const splitError = useMemo(() => {
    if (splitMode === "percentage" && allocationValues.length) {
      const totalPercent = allocationValues.reduce(
        (sum, value) => sum + value,
        0,
      );
      if (totalPercent !== 100) return "Percentages must total 100";
    }
    if (splitMode === "custom" && allocationValues.length) {
      const totalAmount = allocationValues.reduce(
        (sum, value) => sum + value,
        0,
      );
      if (Number(amount || 0) && totalAmount !== Number(amount || 0)) {
        return "Custom amounts must match the total";
      }
    }
    return "";
  }, [allocationValues, amount, splitMode]);

  const participants = useMemo(() => {
    if (!group) return [];
    const count = selectedMemberIds.length || 1;
    return group.members.map((member, index) => {
      const baseShare =
        splitMode === "equal" ? Math.round((100 / count) * 10) / 10 : 0;
      const percent =
        splitMode === "percentage"
          ? Number(allocationValues[index] || 0)
          : baseShare;
      const customShare =
        splitMode === "custom" ? Number(allocationValues[index] || 0) : 0;
      const share =
        splitMode === "custom" && Number(amount || 0)
          ? Math.round((customShare / Number(amount || 0)) * 100 * 10) / 10
          : percent;
      return {
        id: member._id,
        name: member.name,
        share: Number.isFinite(share) ? share : 0,
      };
    });
  }, [allocationValues, amount, group, selectedMemberIds.length, splitMode]);

  const buildParticipants = useCallback(() => {
    if (splitMode === "equal") {
      return selectedMemberIds.map((id) => ({ user: id }));
    }
    if (allocationValues.length !== selectedMemberIds.length) {
      throw new Error("Allocation count must match selected participants");
    }
    return selectedMemberIds.map((id, index) => {
      if (splitMode === "percentage")
        return { user: id, percentage: allocationValues[index] };
      return { user: id, exactAmount: allocationValues[index] };
    });
  }, [allocationValues, selectedMemberIds, splitMode]);

  const onSave = useCallback(async () => {
    setError("");
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    const numAmount = Number(amount);
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError("Select at least one participant");
      return;
    }
    if (splitError) {
      setError(splitError);
      return;
    }

    try {
      setLoading(true);
      const builtParticipants = buildParticipants();
      await API.post("/api/expenses/create", {
        description: description.trim(),
        amount: numAmount,
        paidBy,
        participants: builtParticipants,
        splitType: splitMode === "custom" ? "exact" : splitMode,
        groupId,
      });
      navigation.goBack();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Could not add expense",
      );
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    buildParticipants,
    description,
    groupId,
    navigation,
    paidBy,
    selectedMemberIds.length,
    splitError,
    splitMode,
  ]);

  const toggleParticipant = useCallback((memberId) => {
    setSelectedParticipants((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  }, []);

  if (!group) {
    return (
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.screenV,
            paddingHorizontal: spacing.screenH,
          },
        ]}
      >
        <Text style={textStyles.small}>Loading group members...</Text>
      </View>
    );
  }

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.screenV }]}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={textStyles.small}>Cancel</Text>
      </Pressable>
      <Text style={textStyles.h3}>Add Expense</Text>
      <Pressable onPress={onSave}>
        <Text style={[textStyles.bodyMd, { color: colors.accent }]}>
          {loading ? "Saving..." : "Save"}
        </Text>
      </Pressable>
    </View>
  );

  const renderSplitPerson = useCallback(
    ({ item }) => <SplitPerson name={item.name} share={item.share} />,
    [],
  );

  const renderParticipantChip = useCallback(
    ({ item }) => {
      const selected = selectedParticipants[item._id];
      return (
        <Pressable
          onPress={() => toggleParticipant(item._id)}
          style={[
            styles.participantChip,
            selected && styles.participantChipActive,
          ]}
        >
          <Avatar name={item.name} id={item._id} size={28} />
          <Text
            style={[textStyles.small, selected && styles.participantTextActive]}
          >
            {item.name?.split(" ")[0]}
          </Text>
        </Pressable>
      );
    },
    [selectedParticipants, toggleParticipant],
  );

  const renderPayerChip = useCallback(
    ({ item }) => {
      const active = item._id === paidBy;
      return (
        <Pressable
          onPress={() => setPaidBy(item._id)}
          style={[styles.payerChip, active && styles.payerChipActive]}
        >
          <Avatar name={item.name} id={item._id} size={24} />
          <Text style={[textStyles.tiny, active && styles.payerTextActive]}>
            {item.name?.split(" ")[0]}
          </Text>
        </Pressable>
      );
    },
    [paidBy],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={renderSplitPerson}
        ListHeaderComponent={
          <View style={styles.content}>
            {header}
            <AmountInput value={amount} onChange={setAmount} />

            <View style={styles.formSection}>
              <FieldBlock
                label="Description"
                value={description}
                placeholder="What was the expense for?"
                editable
                onChangeText={setDescription}
              />
              <View style={styles.row}>
                <FieldBlock
                  label="Group"
                  value={group.name}
                  style={styles.half}
                />
                <FieldBlock
                  label="Date"
                  value={new Date().toLocaleDateString("en-IN")}
                  style={styles.half}
                />
              </View>
              <FieldBlock
                label="Paid by"
                value={
                  group.members.find((m) => m._id === paidBy)?.name || "Select"
                }
              />
              <FlatList
                data={group.members}
                keyExtractor={(item) => item._id}
                renderItem={renderPayerChip}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.payerRow}
              />
            </View>

            <View style={styles.splitCard}>
              <View style={styles.splitHeader}>
                <Text style={textStyles.bodyMd}>Split between</Text>
                <SplitPills
                  options={SPLIT_OPTIONS}
                  value={splitMode}
                  onChange={setSplitMode}
                />
              </View>

              <FlatList
                data={group.members}
                keyExtractor={(item) => item._id}
                renderItem={renderParticipantChip}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.participantRow}
              />

              {splitMode !== "equal" ? (
                <FieldBlock
                  label={
                    splitMode === "percentage"
                      ? "Percentages"
                      : "Custom amounts"
                  }
                  value={allocationInput}
                  placeholder="Comma-separated values in member order"
                  editable
                  keyboardType="numeric"
                  onChangeText={setAllocationInput}
                  style={styles.allocationField}
                />
              ) : null}

              {splitError ? (
                <Text style={styles.inlineError}>{splitError}</Text>
              ) : null}
            </View>

            {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          </View>
        }
        ListFooterComponent={
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + spacing.screenV },
            ]}
          >
            <Pressable
              onPress={onSave}
              style={({ pressed }) => [
                styles.submit,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.submitText}>
                {loading ? "Saving..." : "Add Expense"}
              </Text>
              <Text style={textStyles.tiny}>
                {amount ? formatINR(Number(amount || 0), 2) : ""}
              </Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: spacing.screenH }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgScreen,
  },
  content: {
    gap: spacing.gap,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formSection: {
    gap: spacing.gap,
  },
  row: {
    flexDirection: "row",
    gap: spacing.itemGap,
  },
  half: {
    flex: 1,
  },
  splitCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    padding: spacing.cardPad,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.gap,
  },
  splitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: spacing.itemGap,
  },
  participantChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
    paddingHorizontal: spacing.itemGap,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface2,
  },
  participantChipActive: {
    backgroundColor: colors.accentDim,
  },
  participantTextActive: {
    color: colors.white,
  },
  payerRow: {
    flexDirection: "row",
    gap: spacing.itemGap,
  },
  payerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.itemGap,
    paddingHorizontal: spacing.itemGap,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface2,
  },
  payerChipActive: {
    backgroundColor: colors.accentDim,
  },
  payerTextActive: {
    color: colors.white,
  },
  allocationField: {
    marginTop: spacing.itemGap,
  },
  inlineError: {
    ...textStyles.small,
    color: colors.danger,
  },
  footer: {
    marginTop: spacing.gap,
  },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: radius.fab,
    paddingVertical: spacing.cardPad,
    alignItems: "center",
    gap: spacing.xs,
  },
  submitText: {
    ...textStyles.bodyMd,
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
