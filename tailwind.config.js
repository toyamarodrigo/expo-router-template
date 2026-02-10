/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        foreground: "#0F172A",
        card: "#FFFFFF",
        "card-foreground": "#0F172A",
        primary: "#0F172A",
        "primary-foreground": "#F8FAFC",
        secondary: "#F1F5F9",
        "secondary-foreground": "#334155",
        muted: "#F1F5F9",
        "muted-foreground": "#64748B",
        destructive: "#EF4444",
        "destructive-foreground": "#FFFFFF",
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#0F172A",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      fontFamily: {
        "space-mono": ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
