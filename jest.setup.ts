import { afterEach, jest } from "@jest/globals";

const mockSecureStore = new Map<string, string>();

jest.mock("expo-secure-store", () => {
  return {
    getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      mockSecureStore.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      mockSecureStore.delete(key);
    }),
  };
});

afterEach(() => {
  mockSecureStore.clear();
});

jest.mock("@react-native-community/netinfo", () =>
  jest.requireActual("@react-native-community/netinfo/jest/netinfo-mock.js"),
);

jest.mock("@dev-plugins/react-query", () => ({
  useReactQueryDevTools: () => {},
}));

jest.mock("./global.css", () => ({}));
