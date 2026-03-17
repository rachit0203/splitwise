import React, { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClerk } from "@clerk/clerk-expo";
import { colors, radius, spacing, textStyles } from "../theme";
import Avatar from "../components/common/Avatar";
import SectionTitle from "../components/common/SectionTitle";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { signOut } = useClerk();

  const onLogout = useCallback(() => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        signOut();
      }
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut() },
    ]);
  }, [signOut]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.screenV }]}>
      <View style={styles.header}>
        <Avatar name={user?.name} id={user?._id} size={72} />
        <Text style={textStyles.h2}>{user?.name || "User"}</Text>
        <Text style={textStyles.small}>{user?.email}</Text>
      </View>

      <SectionTitle style={styles.sectionTitle}>Account</SectionTitle>
      <Pressable
        onPress={() => navigation.navigate("SettleUp")}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Ionicons name="swap-horizontal" size={18} color={colors.accent} />
        </View>
        <Text style={textStyles.bodyMd}>Settlement</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        </View>
        <Text style={[textStyles.bodyMd, { color: colors.danger }]}>
          Logout
        </Text>
      </Pressable>

      <View style={{ paddingBottom: insets.bottom + spacing.screenV }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgScreen,
    paddingHorizontal: spacing.screenH,
  },
  header: {
    alignItems: "center",
    gap: spacing.itemGap,
    marginBottom: spacing.gap,
  },
  sectionTitle: {
    marginTop: spacing.gap,
    marginBottom: spacing.itemGap,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.rowPad,
    paddingHorizontal: spacing.itemGap,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.itemGap,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
