import { View, Text, Pressable } from "react-native";
import { DrawerContentScrollView, type DrawerContentComponentProps } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuthStore } from "@stores/use-auth-store";
import { ROUTES } from "@utils/constants";

type DrawerNavItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
};

function DrawerNavItem({ icon, label, onPress }: DrawerNavItemProps) {
  return (
    <Pressable className="flex-row items-center gap-3 rounded-md px-3 py-2.5 active:bg-secondary" onPress={onPress}>
      <MaterialCommunityIcons color="#64748B" name={icon} size={20} />
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const navigate = (route: string) => {
    props.navigation.closeDrawer();
    router.push(route as never);
  };

  return (
    <View className="flex-1 bg-card">
      <DrawerContentScrollView {...props} className="flex-1">
        <View className="border-b border-border px-4 pb-4">
          <Text className="text-lg font-bold text-foreground">Expo Template</Text>
          {user ? <Text className="mt-0.5 text-sm text-muted-foreground">@{user.username}</Text> : null}
        </View>

        <View className="gap-1 p-3">
          <DrawerNavItem icon="home" label="Home" onPress={() => navigate(ROUTES.APP_HOME)} />
          <DrawerNavItem icon="counter" label="Counter" onPress={() => navigate(ROUTES.APP_COUNTER)} />
          <DrawerNavItem
            icon="card-account-details"
            label="Details"
            onPress={() => navigate(ROUTES.APP_DETAILS + "?user=evanbacon")}
          />
        </View>
      </DrawerContentScrollView>

      <View className="border-t border-border p-3">
        <Pressable
          className="flex-row items-center gap-3 rounded-md px-3 py-2.5 active:bg-secondary"
          onPress={() => {
            props.navigation.closeDrawer();
            logout();
          }}
        >
          <MaterialCommunityIcons color="#EF4444" name="logout" size={20} />
          <Text className="text-sm font-medium text-destructive">Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const AppLayout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#0F172A",
        headerTitleStyle: { fontWeight: "600" },
        drawerStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
      <Drawer.Screen
        name="pokemon/[id]"
        options={{
          headerShown: false,
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
};

export default AppLayout;
