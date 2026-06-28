import { Tabs } from "expo-router";
import React from "react";
import NavBar from "../../components/navBar";

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transactions",
          }}
        />
        <Tabs.Screen
          name="cards"
          options={{
            title: "Cards",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="addBudget"
          options={{
            title: "Add Budget",
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="addTransactions"
          options={{
            title: "Add Transactions",
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="transactionsDetail"
          options={{
            title: "Transactions Detail",
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="addCards"
          options={{
            title: "Add Cards",
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
      <NavBar />
    </>
  );
}
