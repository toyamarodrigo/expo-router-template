import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@components/button";
import { usePokemonDetail } from "@hooks/use-pokemon";

function DetailSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center border-b border-border bg-card px-4 pb-6 pt-4">
        <View className="h-48 w-48 rounded-full bg-muted" />
        <View className="mt-4 h-7 w-40 rounded bg-muted" />
        <View className="mt-2 h-5 w-20 rounded bg-muted" />
        <View className="mt-3 h-6 w-16 rounded-full bg-muted" />
      </View>
      <View className="gap-4 p-4">
        <View className="gap-3 rounded-lg border border-border bg-card p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <View className="h-5 w-5 rounded bg-muted" />
              <View className="h-4 w-24 rounded bg-muted" />
              <View className="ml-auto h-4 w-16 rounded bg-muted" />
            </View>
          ))}
        </View>
        <View className="gap-3 rounded-lg border border-border bg-card p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} className="gap-1.5">
              <View className="h-4 w-20 rounded bg-muted" />
              <View className="h-3 w-full rounded-full bg-muted" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <MaterialCommunityIcons color="#EF4444" name="alert-circle-outline" size={48} />
      <Text className="mt-3 text-center text-base font-medium text-muted-foreground">{message}</Text>
      <View className="mt-4">
        <Button onPress={onRetry}>Try Again</Button>
      </View>
    </View>
  );
}

type StatBarProps = {
  label: string;
  value: number;
};

function StatBar({ label, value }: StatBarProps) {
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="text-sm font-semibold text-foreground">{value}</Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full bg-secondary">
        <View className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </View>
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center gap-3">
      <MaterialCommunityIcons color="#64748B" name={icon} size={20} />
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="ml-auto text-sm font-semibold capitalize text-foreground">{value}</Text>
    </View>
  );
}

const PokemonDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pokemon, isLoading, isError, error, refetch } = usePokemonDetail(Number(id));
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !pokemon) {
    return <ErrorState message={error?.message ?? "Failed to load Pokemon"} onRetry={refetch} />;
  }

  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKg = (pokemon.weight / 10).toFixed(1);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border bg-card px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <Pressable className="mr-3" onPress={() => router.back()}>
          <MaterialCommunityIcons color="#0F172A" name="arrow-left" size={24} />
        </Pressable>
        <View>
          <Text className="text-2xl font-bold text-foreground">Pokemon</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">Details</Text>
        </View>
      </View>

      <View className="items-center border-b border-border bg-card px-4 pb-6 pt-4">
        <Image
          className="h-48 w-48"
          source={{ uri: pokemon.image }}
        />
        <Text className="mt-4 text-2xl font-bold capitalize text-foreground">{pokemon.name}</Text>
        <Text className="mt-1 text-base text-muted-foreground">#{String(pokemon.id).padStart(3, "0")}</Text>
        <View className="mt-3 rounded-full bg-primary/10 px-4 py-1.5">
          <Text className="text-sm font-semibold capitalize text-primary">{pokemon.type}</Text>
        </View>
      </View>

      <View className="gap-4 p-4">
        <View className="gap-3 rounded-lg border border-border bg-card p-4">
          <Text className="text-base font-semibold text-foreground">Info</Text>
          <InfoRow icon="ruler" label="Height" value={`${heightInMeters} m`} />
          <InfoRow icon="weight" label="Weight" value={`${weightInKg} kg`} />
          <InfoRow icon="star-outline" label="Abilities" value={pokemon.abilities.join(", ")} />
        </View>

        <View className="gap-3 rounded-lg border border-border bg-card p-4">
          <Text className="text-base font-semibold text-foreground">Base Stats</Text>
          <StatBar label="HP" value={pokemon.stats.hp} />
          <StatBar label="Attack" value={pokemon.stats.attack} />
          <StatBar label="Defense" value={pokemon.stats.defense} />
          <StatBar label="Sp. Atk" value={pokemon.stats.specialAttack} />
          <StatBar label="Sp. Def" value={pokemon.stats.specialDefense} />
          <StatBar label="Speed" value={pokemon.stats.speed} />
        </View>
      </View>
    </ScrollView>
  );
};

export default PokemonDetail;
