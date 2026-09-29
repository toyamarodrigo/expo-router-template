import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

type User = {
  username: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (_username: string, _password: string) => void;
  logout: () => void;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// Writes are best effort: a failed write keeps the in-memory state and must not throw into set() or reject unhandled.
const tryWrite = (write: () => void) => {
  try {
    write();
  } catch {}
};

// expo-secure-store has no web implementation, so web falls back to localStorage (not encrypted).
// localStorage is read lazily: it is missing during static rendering, and blocked storage throws on access.
const webStorage: StateStorage = {
  getItem: (key) => (typeof localStorage === "undefined" ? null : localStorage.getItem(key)),
  setItem: (key, value) => tryWrite(() => localStorage.setItem(key, value)),
  removeItem: (key) => tryWrite(() => localStorage.removeItem(key)),
};

const nativeStorage: StateStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value).catch(() => {}),
  removeItem: (key) => SecureStore.deleteItemAsync(key).catch(() => {}),
};

// The factory never throws, so persist always gets a storage and always runs onRehydrateStorage.
const secureStorage = createJSONStorage<AuthState>(() => (process.env.EXPO_OS === "web" ? webStorage : nativeStorage));

// Separate store so persist can flag it even during synchronous (web) hydration, before useAuthStore exists.
// Its initial value doubles as the SSR snapshot, so static web renders and client hydration both start pending.
const useAuthHydrationStore = create<boolean>()(() => false);

export const useAuthHasHydrated = () => useAuthHydrationStore((hasHydrated) => hasHydrated);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (username: string, password: string) => {
        // DEMO ONLY: hardcoded credentials. Replace with a real auth provider; never ship credentials in the client.
        const isValid = username === "demo" && password === "password";

        if (isValid) {
          set({ isAuthenticated: true, user: { username } });
        } else {
          throw new AuthError("Invalid credentials");
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: secureStorage,
      // Runs on every (re)hydration; the returned callback fires on both success and failure.
      onRehydrateStorage: (state) => {
        useAuthHydrationStore.setState(false, true);

        return (_, error) => {
          // An unreadable session is unusable: sign out (overwriting it) so routing falls back to login.
          // Never log the error or stored value; they may contain session data.
          // If the write fails, the unreadable value stays in storage, but the in-memory sign-out still applies.
          try {
            if (error) {
              console.warn("Could not restore the auth session; signing out.");
              state.logout();
            }
          } finally {
            useAuthHydrationStore.setState(true, true);
          }
        };
      },
      partialize: (state) =>
        ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
        }) as AuthState,
    },
  ),
);
