import { describe, expect, it } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import Login from "../app/(auth)/login";

describe("Login screen", () => {
  it("shows required errors when submitted empty", async () => {
    render(<Login />);

    await act(async () => {
      fireEvent.press(screen.getByText("Sign In"));
    });

    expect(await screen.findByText("Username is required")).toBeOnTheScreen();
    expect(screen.getByText("Password is required")).toBeOnTheScreen();
  });

  it("shows invalid credentials for a wrong password", async () => {
    render(<Login />);

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText("Enter your username"), "demo");
      fireEvent.changeText(screen.getByPlaceholderText("Enter your password"), "wrong-password");
      fireEvent.press(screen.getByText("Sign In"));
    });

    expect(await screen.findByText("Invalid credentials")).toBeOnTheScreen();
  });
});
