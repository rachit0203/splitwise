import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import FriendsScreen from "../screens/FriendsScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import GroupListScreen from "../screens/GroupListScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupDetailsScreen from "../screens/GroupDetailsScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ExpenseDetailsScreen from "../screens/ExpenseDetailsScreen";
import SettlementScreen from "../screens/SettlementScreen";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ title: "Add Friend" }}
      />
      <Stack.Screen name="Groups" component={GroupListScreen} />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: "Create Group" }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ title: "Group Details" }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: "Add Expense" }}
      />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: "Expense Details" }}
      />
      <Stack.Screen name="Settlement" component={SettlementScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#115e59" />
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
