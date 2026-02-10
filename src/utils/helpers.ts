import { twMerge } from "tailwind-merge";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}
