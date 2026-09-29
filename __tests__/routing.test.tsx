import { Text } from "react-native";
import { describe, expect, it, beforeEach } from "@jest/globals";
import { renderRouter, screen, waitFor } from "expo-router/testing-library";

import { useAuthStore } from "@stores/use-auth-store";

import RootLayout from "../app/_layout";

const routes = {
  _layout: RootLayout,
  "(auth)/login": () => <Text>Login screen</Text>,
  "(app)/(tabs)/index": () => <Text>Home screen</Text>,
};

describe("AuthGate routing", () => {
  beforeEach(async () => {
    await useAuthStore.persist.rehydrate();
    useAuthStore.setState({ isAuthenticated: false, user: null });
  });

  it("redirects to login without a session", async () => {
    const router = renderRouter(routes, { initialUrl: "/" });

    await waitFor(() => expect(router.getPathname()).toBe("/login"));
    expect(screen.getByText("Login screen")).toBeVisible();
    expect(screen.queryByText("Home screen")).not.toBeOnTheScreen();
  });

  it("redirects to tabs with a session", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { username: "demo" } });
    const router = renderRouter(routes, { initialUrl: "/login" });

    await waitFor(() => expect(router.getPathname()).toBe("/"));
    expect(screen.getByText("Home screen")).toBeVisible();
    expect(screen.queryByText("Login screen")).not.toBeOnTheScreen();
  });
});
