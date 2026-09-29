import type { ComponentProps } from "react";
import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from "@react-native-vector-icons/material-design-icons";

// Single entry point for icons, so the icon set can change in one place.
export type IconName = MaterialDesignIconsIconName;
export type IconProps = ComponentProps<typeof MaterialDesignIcons>;

export function Icon(props: IconProps) {
  return <MaterialDesignIcons {...props} />;
}
