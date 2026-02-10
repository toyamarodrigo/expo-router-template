import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@components/button";
import { Input } from "@components/input";

const Details = () => {
  const { user } = useLocalSearchParams<{ user: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [newUser, setNewUser] = useState("");
  const insets = useSafeAreaInsets();

  const handleUpdateUser = () => {
    if (newUser.trim()) {
      router.push(`/(app)/(tabs)/details?user=${encodeURIComponent(newUser.trim())}` as never);
      setNewUser("");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border bg-card px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center gap-3">
          <Pressable hitSlop={8} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <MaterialCommunityIcons color="#64748B" name="menu" size={24} />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-foreground">Details</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">URL parameters demo</Text>
          </View>
        </View>
      </View>

      <View className="gap-4 p-4">
        <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <MaterialCommunityIcons color="#64748B" name="account" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">Current user</Text>
            <Text className="text-base font-semibold text-foreground">{user ?? "none"}</Text>
          </View>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="mb-3 text-base font-semibold text-foreground">Update User Param</Text>
          <View className="gap-3">
            <Input
              autoCapitalize="none"
              placeholder="Enter a username"
              returnKeyType="done"
              value={newUser}
              onChangeText={setNewUser}
              onSubmitEditing={handleUpdateUser}
            />
            <Button onPress={handleUpdateUser}>Update User</Button>
          </View>
        </View>

        <View className="rounded-lg border border-border bg-secondary/50 p-4">
          <Text className="text-sm text-muted-foreground">
            This screen demonstrates URL search parameters in Expo Router. The &quot;user&quot; param is passed via the
            URL and updates when you navigate with a new value.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Details;
