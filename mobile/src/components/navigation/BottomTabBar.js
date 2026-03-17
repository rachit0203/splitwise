import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, textStyles } from "../../theme";

const TAB_ICONS = {
  Home: { focused: "home", unfocused: "home-outline" },
  Groups: { focused: "people", unfocused: "people-outline" },
  Activity: { focused: "pulse", unfocused: "pulse-outline" },
  Profile: { focused: "person-circle", unfocused: "person-circle-outline" },
};

export default function BottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.itemGap) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const icon = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <Ionicons
              name={isFocused ? icon.focused : icon.unfocused}
              size={22}
              color={isFocused ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                textStyles.tiny,
                styles.label,
                isFocused && styles.activeLabel,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.bgScreen,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.itemGap,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  activeLabel: {
    color: colors.accent,
  },
  label: {
    fontSize: 10,
  },
});
