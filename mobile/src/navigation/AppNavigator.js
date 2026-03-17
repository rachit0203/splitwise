import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../theme";
import { setTokenProvider } from "../../services/api";

import BottomTabBar from "../components/navigation/BottomTabBar";
import DashboardScreen from "../screens/DashboardScreen";
import GroupsScreen from "../screens/GroupsScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ActivityScreen from "../screens/ActivityScreen";
import ProfileScreen from "../screens/ProfileScreen";

import LoginScreen from "../../screens/LoginScreen";
import RegisterScreen from "../../screens/RegisterScreen";
import SettlementScreen from "../../screens/SettlementScreen";
import CreateGroupScreen from "../../screens/CreateGroupScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { loading } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setTokenProvider(() => getToken());
    } else {
      setTokenProvider(null);
    }
  }, [isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bgBase,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="GroupDetail" component={GroupDetailScreen} />
          <RootStack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <RootStack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{ presentation: "modal" }}
          />
          <RootStack.Screen
            name="SettleUp"
            component={SettlementScreen}
            options={{ presentation: "modal" }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
