import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing, borderRadius, shadow } from "../utils/theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      Alert.alert(
        "Registration failed",
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
            <Ionicons name="person-add" size={32} color="#fff" />
          </View>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.tagline}>Join and start splitting expenses</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Input
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
          />
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
            placeholder="Password (min 6 characters)"
            secureTextEntry
          />

          <View style={styles.btnGap}>
            <PrimaryButton
              title={loading ? "Creating account..." : "Register"}
              icon="checkmark-circle-outline"
              onPress={onRegister}
              disabled={loading}
            />
          </View>
          <View style={styles.btnGap}>
            <PrimaryButton
              title="Already have an account? Login"
              type="outline"
              onPress={() => navigation.goBack()}
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
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadow.md,
  },
  heading: {
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
  btnGap: {
    marginTop: spacing.sm,
  },
});
