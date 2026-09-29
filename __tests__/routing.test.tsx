import { Text } from "react-native";
import { afterEach, describe, expect, it, beforeEach, jest } from "@jest/globals";
import { act, renderRouter, screen, waitFor } from "expo-router/testing-library";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

import { useAuthStore } from "@stores/use-auth-store";

import RootLayout from "../app/_layout";

// Lets a test publish the empty segments Expo Router reports while the initial URL is pending or after a route throws.
const mockSegments = { override: null as string[] | null, listeners: new Set<() => void>() };

jest.mock("expo-router", () => {
  const actual = jest.requireActual<typeof import("expo-router")>("expo-router");
  const { useSyncExternalStore } = jest.requireActual<typeof import("react")>("react");
  const subscribe = (listener: () => void) => {
    mockSegments.listeners.add(listener);
    return () => mockSegments.listeners.delete(listener);
  };

  return {
    ...actual,
    useSegments: () => {
      const segments = actual.useSegments();
      const override = useSyncExternalStore(subscribe, () => mockSegments.override);
      return override ?? segments;
    },
  };
});

const setSegmentsOverride = (segments: string[] | null) => {
  mockSegments.override = segments;
  for (const listener of mockSegments.listeners) listener();
};

afterEach(() => {
  mockSegments.override = null;
});

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

  it("waits for an async restored session before routing", async () => {
    let resolveSession: (value: string | null) => void = () => {};
    jest.mocked(SecureStore.getItemAsync).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSession = resolve;
        }),
    );
    const restoring = useAuthStore.persist.rehydrate();
    jest.mocked(SplashScreen.hideAsync).mockClear();

    const LoginScreen = jest.fn(() => <Text>Login screen</Text>);
    const router = renderRouter(
      { ...routes, "(auth)/login": LoginScreen },
      { initialUrl: "/" },
    );

    expect(screen.queryByText("Home screen")).not.toBeOnTheScreen();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    await act(async () => {
      resolveSession(
        JSON.stringify({
          state: { isAuthenticated: true, user: { username: "demo" } },
          version: 0,
        }),
      );
      await restoring;
    });

    await waitFor(() => expect(screen.getByText("Home screen")).toBeVisible());
    expect(router.getPathname()).toBe("/");
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(LoginScreen).not.toHaveBeenCalled();
  });

  it("signs out and routes to login when the stored session cannot be read", async () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      useAuthStore.setState({ isAuthenticated: true, user: { username: "demo" } });
      jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error("Keychain unavailable"));
      // The sign-out write also fails; it must not block hydration, warn again, or reject unhandled.
      let writeRejectionHandled = false;
      jest.mocked(SecureStore.setItemAsync).mockClear();
      jest.mocked(SecureStore.setItemAsync).mockImplementationOnce(() => {
        const write = Promise.reject<void>(new Error("Keychain unavailable"));
        const then = write.then.bind(write);
        // catch() goes through then(), so this records whether the store attaches a rejection handler.
        write.then = (onFulfilled, onRejected) => {
          writeRejectionHandled ||= onRejected != null;
          return then(onFulfilled, onRejected);
        };
        return write;
      });
      jest.mocked(SplashScreen.hideAsync).mockClear();

      await act(async () => {
        await useAuthStore.persist.rehydrate();
      });

      expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null });
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        "auth-storage",
        JSON.stringify({ state: { isAuthenticated: false, user: null }, version: 0 }),
      );
      expect(writeRejectionHandled).toBe(true);
      expect(consoleWarn).toHaveBeenCalledTimes(1);
      // Exact arguments: the storage error must never be passed to or interpolated into the warning.
      expect(consoleWarn).toHaveBeenCalledWith("Could not restore the auth session; signing out.");

      const router = renderRouter(routes, { initialUrl: "/" });

      await waitFor(() => expect(screen.getByText("Login screen")).toBeVisible());
      expect(router.getPathname()).toBe("/login");
      expect(SplashScreen.hideAsync).toHaveBeenCalled();

      act(() => useAuthStore.getState().login("demo", "password"));

      await waitFor(() => expect(screen.getByText("Home screen")).toBeVisible());
      expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, user: { username: "demo" } });
      expect(consoleWarn).toHaveBeenCalledTimes(1);
    } finally {
      consoleWarn.mockRestore();
    }
  });
});

describe("AuthGate splash", () => {
  beforeEach(async () => {
    await useAuthStore.persist.rehydrate();
    useAuthStore.setState({ isAuthenticated: false, user: null });
    jest.mocked(SplashScreen.hideAsync).mockClear();
  });

  it("keeps the splash up until the redirect target renders", async () => {
    const LoginScreen = jest.fn(() => <Text>Login screen</Text>);
    const loginRenderedAtHide: boolean[] = [];
    jest.mocked(SplashScreen.hideAsync).mockImplementation(async () => {
      loginRenderedAtHide.push(LoginScreen.mock.calls.length > 0);
    });

    renderRouter({ ...routes, "(auth)/login": LoginScreen }, { initialUrl: "/" });

    await waitFor(() => expect(screen.getByText("Login screen")).toBeVisible());
    expect(loginRenderedAtHide.length).toBeGreaterThan(0);
    expect(loginRenderedAtHide).not.toContain(false);
  });

  it("hides the splash when a route throws and the error fallback shows", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    useAuthStore.setState({ isAuthenticated: true, user: { username: "demo" } });
    const BrokenHome = () => {
      throw new Error("Home crashed");
    };

    renderRouter({ ...routes, "(app)/(tabs)/index": BrokenHome }, { initialUrl: "/" });

    await waitFor(() => expect(screen.getByText("Something went wrong")).toBeVisible());
    expect(screen.getByText("Home crashed")).toBeVisible();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("keeps an auth route's error fallback when the navigator reports empty segments", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const BrokenLogin = jest.fn(() => {
      throw new Error("Login crashed");
    });

    const router = renderRouter({ ...routes, "(auth)/login": BrokenLogin }, { initialUrl: "/login" });

    await waitFor(() => expect(screen.getByText("Something went wrong")).toBeVisible());
    const rendersBefore = BrokenLogin.mock.calls.length;

    // Simulates Expo Router unmounting the crashed navigator and publishing no segments.
    act(() => setSegmentsOverride([]));

    expect(screen.getByText("Something went wrong")).toBeVisible();
    expect(screen.getByText("Login crashed")).toBeVisible();
    expect(router.getPathname()).toBe("/login");
    expect(BrokenLogin).toHaveBeenCalledTimes(rendersBefore);
    consoleError.mockRestore();
  });

  it("keeps the splash up while the initial route group is pending", async () => {
    const LoginScreen = jest.fn(() => <Text>Login screen</Text>);
    // Simulates an Android cold start where the initial URL resolves asynchronously.
    setSegmentsOverride([]);

    const router = renderRouter({ ...routes, "(auth)/login": LoginScreen }, { initialUrl: "/" });

    await act(async () => {});
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
    expect(LoginScreen).not.toHaveBeenCalled();
    expect(router.getPathname()).toBe("/");

    act(() => setSegmentsOverride(null));

    await waitFor(() => expect(screen.getByText("Login screen")).toBeVisible());
    expect(router.getPathname()).toBe("/login");
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });
});
