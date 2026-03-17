import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing } from "../utils/theme";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const onLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Avatar name={user?.name} size={72} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card onPress={() => navigation.navigate("Settlement")}>
        <View style={styles.menuRow}>
          <View style={styles.menuIcon}>
            <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Settlement</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
        </View>
      </Card>

      <View style={styles.logoutWrap}>
        <PrimaryButton
          title="Logout"
          type="danger"
          icon="log-out-outline"
          onPress={onLogout}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
  },
  logoutWrap: {
    marginTop: spacing.xxxl,
  },
});
