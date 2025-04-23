import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppState(onChange: (_: AppStateStatus) => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);
}
