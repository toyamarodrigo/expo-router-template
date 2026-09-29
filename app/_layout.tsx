import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Slot, Redirect, useSegments } from "expo-router";
import type { Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

import { ErrorBoundary } from "@components/error-boundary";
import { useOnlineManager } from "@hooks/use-online-manager";
import { useAuthHasHydrated, useAuthStore } from "@stores/use-auth-store";

import "../global.css";

// Keep the native splash up until the persisted session is restored.
if (Platform.OS !== "web") SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [segment] = useSegments();
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Every URL matches a group or the catch-all, so empty segments only mean "not known yet" (async initial URL)
  // or "navigator unmounted" (a route child threw). Keep the last known group so neither case changes routing.
  const [lastGroup, setLastGroup] = useState<string | undefined>(segment);

  if (segment && segment !== lastGroup) setLastGroup(segment);

  const group = segment ?? lastGroup;

  const isGroupKnown = group !== undefined;
  const inAuthGroup = group === "(auth)";
  const redirectTo: Href | null =
    !isAuthenticated && isGroupKnown && !inAuthGroup
      ? "/(auth)/login"
      : isAuthenticated && inAuthGroup
        ? "/(app)/(tabs)"
        : null;
  // Only reveal the app once the intended route group is active, so no blank frame shows mid-redirect.
  const isReady = hasHydrated && isGroupKnown && redirectTo === null;

  // AuthGate owns the ErrorBoundary below, so this effect still commits when a route child throws.
  useEffect(() => {
    if (isReady && Platform.OS !== "web") void SplashScreen.hideAsync();
  }, [isReady]);

  // Web has no native splash: render nothing rather than guess the session.
  if (!hasHydrated) return null;

  if (redirectTo) return <Redirect href={redirectTo} />;

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

const RootLayout = () => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  useReactQueryDevTools(client);
  useOnlineManager();

  return (
    <QueryClientProvider client={client}>
      <AuthGate>
        <Slot />
      </AuthGate>
    </QueryClientProvider>
  );
};

export default RootLayout;
