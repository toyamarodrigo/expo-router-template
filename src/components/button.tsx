import { ActivityIndicator, Pressable, Text } from "react-native";
import type { PressableProps } from "react-native";
import type { ReactNode } from "react";

import { cn } from "@utils/helpers";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: string | ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary active:opacity-80",
  secondary: "bg-secondary active:opacity-80",
  outline: "border border-border bg-transparent active:bg-secondary",
  ghost: "bg-transparent active:bg-secondary",
  destructive: "bg-destructive active:opacity-80",
};

const variantTextClasses: Record<ButtonVariant, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5",
  md: "px-5 py-2.5",
  lg: "px-7 py-3.5",
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-md",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "opacity-50",
        className,
      )}
      disabled={isDisabled}
      style={{ borderCurve: "continuous" }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "default" || variant === "destructive" ? "#F8FAFC" : "#0F172A"}
          size="small"
        />
      ) : typeof children === "string" ? (
        <Text className={cn("font-semibold", variantTextClasses[variant], sizeTextClasses[size])}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
