import { beforeEach, describe, expect, it } from "@jest/globals";

import { AuthError, useAuthStore } from "./use-auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("logs in with the demo credentials", () => {
    useAuthStore.getState().login("demo", "password");

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.username).toBe("demo");
  });

  it("rejects a wrong password with AuthError", () => {
    expect(() => useAuthStore.getState().login("demo", "wrong-password")).toThrow(AuthError);

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("clears the session and user on logout", () => {
    useAuthStore.getState().login("demo", "password");
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
