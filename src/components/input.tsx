import { Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { forwardRef } from "react";

import { cn } from "@utils/helpers";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, className, ...rest }, ref) => {
  return (
    <View className="gap-1.5">
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={cn(
          "rounded-md border border-input bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground",
          error && "border-destructive",
          className,
        )}
        placeholderTextColor="#64748B"
        style={{ borderCurve: "continuous" }}
        {...rest}
      />
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
});

Input.displayName = "Input";
