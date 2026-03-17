import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing, borderRadius } from "../utils/theme";

export default function SettlementScreen() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [amountByUser, setAmountByUser] = useState({});

  const loadData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const [balanceRes, historyRes] = await Promise.all([
        API.get(`/api/balances/user/${user._id}`),
        API.get("/api/settlement/history/me"),
      ]);
      setBalances(balanceRes.data.balances || []);
      setHistory(historyRes.data.settlements || []);
    } catch (e) {
      console.warn("Load settlement error:", e.message);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onSettle = async (receiverId) => {
    const amount = Number(amountByUser[receiverId] || 0);
    if (amount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than zero");
      return;
    }
    try {
      await API.post("/api/settlement", {
        payer: user._id,
        receiver: receiverId,
        amount,
      });
      setAmountByUser((prev) => ({ ...prev, [receiverId]: "" }));
      await loadData();
    } catch (error) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Could not settle payment",
      );
    }
  };

  const debts = balances.filter((item) => item.balance < 0);

  return (
    <ScreenContainer>
      {/* Settle Payments */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
        {"  "}Settle Payments
      </Text>

      {debts.length === 0 ? (
        <Card>
          <View style={styles.emptyRow}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.emptyText}>All settled! No outstanding debts.</Text>
          </View>
        </Card>
      ) : null}

      {debts.map((item) => (
        <Card key={item.user._id}>
          <View style={styles.debtRow}>
            <Avatar name={item.user.name} size={40} />
            <View style={styles.debtInfo}>
              <Text style={styles.debtName}>You owe {item.user.name}</Text>
              <Text style={styles.debtAmount}>
                ₹{Math.abs(item.balance).toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.settleRow}>
            <View style={{ flex: 1 }}>
              <Input
                icon="cash-outline"
                value={amountByUser[item.user._id] || ""}
                onChangeText={(v) =>
                  setAmountByUser((prev) => ({ ...prev, [item.user._id]: v }))
                }
                placeholder="Amount"
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: spacing.sm }} />
            <PrimaryButton
              title="Settle"
              icon="checkmark"
              compact
              onPress={() => onSettle(item.user._id)}
            />
          </View>
        </Card>
      ))}

      {/* History */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="time-outline" size={16} color={colors.secondary} />
        {"  "}Settlement History
      </Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>No settlement history</Text>
      ) : null}

      {history.map((entry) => (
        <Card key={entry._id}>
          <View style={styles.historyRow}>
            <View style={styles.historyIcon}>
              <Ionicons name="checkmark-done" size={18} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyName}>
                {entry.payer?._id === user._id
                  ? "You paid"
                  : `${entry.payer?.name} paid`}{" "}
                {entry.receiver?.name}
              </Text>
              <Text style={styles.historyMeta}>
                ₹{Number(entry.amount).toFixed(2)} ·{" "}
                {new Date(entry.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </Card>
      ))}
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
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  emptyText: {
    color: colors.success,
    fontWeight: "600",
    fontSize: fontSize.md,
    flex: 1,
  },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  debtInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  debtName: {
    fontWeight: "600",
    color: colors.text,
    fontSize: fontSize.md,
  },
  debtAmount: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: fontSize.md,
    marginTop: 2,
  },
  settleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  historyName: {
    fontWeight: "500",
    color: colors.text,
    fontSize: fontSize.md,
  },
  historyMeta: {
    color: colors.subtext,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  empty: {
    color: colors.subtext,
    textAlign: "center",
    paddingVertical: spacing.lg,
    fontSize: fontSize.sm,
  },
});
