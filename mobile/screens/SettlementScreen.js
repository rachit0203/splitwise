import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../utils/theme";

export default function SettlementScreen() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [amountByUser, setAmountByUser] = useState({});

  const loadData = useCallback(async () => {
    const [balanceRes, historyRes] = await Promise.all([
      API.get(`/api/balances/user/${user._id}`),
      API.get("/api/settlement/history/me"),
    ]);

    setBalances(balanceRes.data.balances || []);
    setHistory(historyRes.data.settlements || []);
  }, [user._id]);

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
      <Text style={styles.section}>Settle Payments</Text>
      {debts.length === 0 ? (
        <Text style={styles.empty}>No outstanding debts</Text>
      ) : null}
      {debts.map((item) => (
        <View key={item.user._id} style={styles.card}>
          <Text style={styles.name}>You owe {item.user.name}</Text>
          <Text style={styles.meta}>
            Rs {Math.abs(item.balance).toFixed(2)}
          </Text>
          <TextInput
            value={amountByUser[item.user._id] || ""}
            onChangeText={(value) =>
              setAmountByUser((prev) => ({ ...prev, [item.user._id]: value }))
            }
            placeholder="Enter amount"
            keyboardType="numeric"
            style={styles.input}
          />
          <PrimaryButton
            title="Settle"
            onPress={() => onSettle(item.user._id)}
          />
        </View>
      ))}

      <Text style={styles.section}>Settlement History</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>No settlement history</Text>
      ) : null}
      {history.map((entry) => (
        <View key={entry._id} style={styles.card}>
          <Text style={styles.name}>
            {entry.payer?._id === user._id
              ? "You paid"
              : `${entry.payer?.name} paid`}{" "}
            {entry.receiver?.name}
          </Text>
          <Text style={styles.meta}>Rs {Number(entry.amount).toFixed(2)}</Text>
          <Text style={styles.meta}>
            {new Date(entry.date).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    gap: 6,
  },
  name: {
    color: colors.text,
    fontWeight: "600",
  },
  meta: {
    color: colors.subtext,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
  },
  empty: {
    marginTop: 8,
    color: colors.subtext,
  },
});
