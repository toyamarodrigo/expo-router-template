import { Component } from "react";
import { Text, View } from "react-native";
import type { ErrorInfo, ReactNode } from "react";

import { Button } from "./button";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-background p-8">
          <Text className="text-xl font-bold text-foreground">Something went wrong</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <View className="mt-4">
            <Button onPress={this.handleReset}>Try Again</Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
