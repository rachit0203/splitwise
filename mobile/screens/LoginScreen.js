import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing, borderRadius, shadow } from "../utils/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert(
        "Login failed",
        error?.response?.data?.message || "Please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false} style={styles.screen}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>Split Expenses</Text>
          <Text style={styles.tagline}>Manage shared expenses effortlessly</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>

          <Input
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          <View style={styles.btnGap}>
            <PrimaryButton
              title={loading ? "Logging in..." : "Login"}
              icon="log-in-outline"
              onPress={onLogin}
              disabled={loading}
            />
          </View>
          <View style={styles.btnGap}>
            <PrimaryButton
              title="Create account"
              type="outline"
              icon="person-add-outline"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
  },
  container: {
    width: "100%",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadow.md,
  },
  appName: {
    fontSize: fontSize.hero,
    fontWeight: "800",
    color: colors.text,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadow.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  btnGap: {
    marginTop: spacing.sm,
  },
});
