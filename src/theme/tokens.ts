export const tokens = {
  colors: {
    canvas: "#FAF9F7",
    surface: "#FFFFFF",
    textPrimary: "#3B0026",
    textSecondary: "rgba(59, 0, 38, 0.72)",
    textStrong: "#111111",
    textSubtle: "#555555",
    borderDefault: "rgba(12, 11, 10, 0.06)",
    borderSubtle: "rgba(12, 11, 10, 0.04)",
    accentAlert: "#FF5E0D",
    white: "#FFFFFF",
  },
  typography: {
    fontFamily: {
      sans: "Saans-TRIAL",
      body: "Inter",
    },
    size: {
      sm: 14,
      base: 16,
      lg: 20,
    },
    lineHeight: {
      name: 26,
      subtitle: 25.2,
      body: 22.4,
    },
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 12,
    lg: 24,
    xl: 32,
    screenPaddingXMobile: 12,
    screenPaddingXTablet: 24,
    screenPaddingY: 65,
    navPaddingX: 24,
    navPaddingY: 12,
    navGap: 32,
  },
  radii: {
    sm: 4,
    avatar: 100,
    full: 999,
  },
  sizes: {
    navIcon: 24,
    navDot: 5,
    navDotOffset: 4,
    navWidthMobile: 390,
    navWidthTablet: 112,
    contentMaxWidth: 800,
  },
  borders: {
    hairline: 1,
  },
} as const;
