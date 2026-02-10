import { useState } from "react";
import { Slot, Redirect, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

import { ErrorBoundary } from "@components/error-boundary";
import { useOnlineManager } from "@hooks/use-online-manager";
import { useAuthStore } from "@stores/use-auth-store";

import "../global.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const inAuthGroup = segments[0] === "(auth)";

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <>{children}</>;
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
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <AuthGate>
          <Slot />
        </AuthGate>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default RootLayout;
