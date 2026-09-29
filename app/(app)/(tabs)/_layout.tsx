import { Tabs } from "expo-router";

import { Icon } from "@components/icon";

const AppTabs = () => {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon color={color} name="home" size={size} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: "Counter",
          tabBarIcon: ({ color, size }) => <Icon color={color} name="counter" size={size} />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "Details",
          href: { pathname: "/(app)/(tabs)/details", params: { user: "evanbacon" } },
          tabBarIcon: ({ color, size }) => <Icon color={color} name="card-account-details" size={size} />,
        }}
      />
    </Tabs>
  );
};

export default AppTabs;
