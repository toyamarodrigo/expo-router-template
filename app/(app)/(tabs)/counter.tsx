import { Pressable, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@components/button";
import { useAppStore } from "@stores/use-app-store";

const Counter = () => {
  const count = useAppStore((s) => s.count);
  const increment = useAppStore((s) => s.increment);
  const decrement = useAppStore((s) => s.decrement);
  const reset = useAppStore((s) => s.reset);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border bg-card px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center gap-3">
          <Pressable hitSlop={8} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <MaterialCommunityIcons color="#64748B" name="menu" size={24} />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-foreground">Counter</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">Zustand state management</Text>
          </View>
        </View>
      </View>
      <View className="flex-1 items-center justify-center px-6">
      <View className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <View className="mb-6 items-center">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-secondary">
            <MaterialCommunityIcons color="#64748B" name="counter" size={24} />
          </View>
          <Text className="text-xl font-bold text-foreground">Counter</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">Zustand state management</Text>
        </View>

        <View className="mb-6 items-center rounded-md bg-secondary px-6 py-4">
          <Text className="text-5xl font-bold text-foreground">{count}</Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button variant="outline" onPress={decrement}>
              -
            </Button>
          </View>
          <View className="flex-1">
            <Button variant="secondary" onPress={reset}>
              Reset
            </Button>
          </View>
          <View className="flex-1">
            <Button onPress={increment}>+</Button>
          </View>
        </View>
      </View>
      </View>
    </View>
  );
};

export default Counter;
