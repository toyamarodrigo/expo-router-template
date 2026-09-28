import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

// expo-secure-store has no web implementation, so web falls back to localStorage (not encrypted).
const secureStorage = createJSONStorage<AuthState>(() =>
  process.env.EXPO_OS === "web"
    ? localStorage
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      },
);

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
      partialize: (state) =>
        ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
        }) as AuthState,
    },
  ),
);
