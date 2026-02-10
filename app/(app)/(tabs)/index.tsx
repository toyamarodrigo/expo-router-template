import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePokemonList } from "@hooks/use-pokemon";
import { useRefreshByUser } from "@hooks/use-refresh-by-user";
import { useRefreshOnFocus } from "@hooks/use-refresh-on-focus";

function extractIdFromUrl(url: string): string {
  const parts = url.replace(/\/$/, "").split("/");

  return parts[parts.length - 1];
}

function LoadingSkeleton() {
  return (
    <View className="gap-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 rounded-lg bg-muted" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-32 rounded bg-muted" />
            <View className="h-3 w-16 rounded bg-muted" />
          </View>
          <View className="h-5 w-5 rounded bg-muted" />
        </View>
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialCommunityIcons color="#94A3B8" name="pokeball" size={48} />
      <Text className="mt-3 text-base font-medium text-muted-foreground">No Pokemon found</Text>
    </View>
  );
}

function ItemSeparator() {
  return <View className="h-3" />;
}

type PokemonListItemProps = {
  name: string;
  id: string;
};

const PokemonListItem = memo(function PokemonListItem({ name, id }: PokemonListItemProps) {
  return (
    <Link href={`/(app)/pokemon/${id}`} asChild>
      <Pressable className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4" style={{ borderCurve: "continuous" }}>
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary" style={{ borderCurve: "continuous" }}>
          <MaterialCommunityIcons color="#64748B" name="pokeball" size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold capitalize text-foreground">{name}</Text>
          <Text className="text-sm text-muted-foreground">#{id.padStart(3, "0")}</Text>
        </View>
        <MaterialCommunityIcons color="#94A3B8" name="chevron-right" size={20} />
      </Pressable>
    </Link>
  );
});

const Home = () => {
  const { data, isLoading, refetch } = usePokemonList();
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useRefreshOnFocus(refetch);

  const results = data?.results ?? [];

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-border bg-card px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center gap-3">
          <Pressable hitSlop={8} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <MaterialCommunityIcons color="#64748B" name="menu" size={24} />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-foreground">Pokemon</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">Browse the Pokedex</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <LoadingSkeleton />
      ) : results.length === 0 ? (
        <EmptyState />
      ) : (
        <FlashList
          ItemSeparatorComponent={ItemSeparator}
          contentContainerClassName="p-4"
          data={results}
          keyExtractor={(item) => item.name}
          refreshing={isRefetchingByUser}
          renderItem={({ item }) => {
            const id = extractIdFromUrl(item.url);

            return <PokemonListItem id={id} name={item.name} />;
          }}
          onRefresh={refetchByUser}
        />
      )}
    </View>
  );
};

export default Home;
