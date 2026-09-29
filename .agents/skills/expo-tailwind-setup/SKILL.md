---
name: expo-tailwind-setup
description: NativeWind and Tailwind CSS in Expo. Use to check or change the current NativeWind 4 + Tailwind CSS 3 setup (Babel, Metro, tailwind.config.js, global.css), or to plan the NativeWind 5 + Tailwind CSS 4 (react-native-css) migration.
version: 1.1.0
license: MIT
---

# Tailwind CSS Setup for Expo (NativeWind)

> **Current template state:** this template uses **NativeWind 4.2.7 + Tailwind CSS 3.4**. See "Current NativeWind 4 Setup" below. NativeWind 5 + Tailwind CSS 4 is **migration backlog**. All sections after "NativeWind v5 Migration (Backlog)" describe the v5 path. Do not apply them unless the task is the v5 migration.

## Current NativeWind 4 Setup

Versions: `nativewind@4.2.7`, `tailwindcss@^3.4`.

`babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        { jsxImportSource: "nativewind", unstable_transformImportMeta: true },
      ],
      "nativewind/babel",
    ],
  };
};
```

`metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
});
```

`tailwind.config.js` (minimal example; this repository's config also extends semantic colors, border radii, and the Space Mono font):

```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

`global.css` (Tailwind v3 directives), imported once in `app/_layout.tsx`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`nativewind-env.d.ts` (at the project root) adds `className` typing to React Native components:

```ts
/// <reference types="nativewind/types" />
```

Install packages with the project package manager. This repository uses Bun, so use `bunx expo install <package>` (equivalent to `npx expo install <package>`) and `bunx expo install --dev <package>` for dev dependencies.

## NativeWind v5 Migration (Backlog)

All sections below describe the NativeWind v5 + Tailwind CSS v4 path (react-native-css). Their headings end with "(v5)". They do not apply to the current v4 setup.

## Overview (v5)

This setup uses:

- **Tailwind CSS v4** - Modern CSS-first configuration
- **react-native-css** - CSS runtime for React Native
- **NativeWind v5** - Metro transformer for Tailwind in React Native
- **@tailwindcss/postcss** - PostCSS plugin for Tailwind v4

## Installation (v5)

NativeWind 5 is a preview release. Versions change often, so this skill does not pin them. Read the current [official NativeWind v5 migration guide](https://www.nativewind.dev/v5/guides/migrate-from-v4) before you start.

```bash
bunx expo install nativewind@preview react-native-css@latest react-native-reanimated react-native-safe-area-context
bunx expo install --dev tailwindcss @tailwindcss/postcss postcss
```

**Dependency placement:** this repository currently declares `tailwindcss` and `postcss` in `dependencies`. The v5 migration should move them to `devDependencies`, as the `bunx expo install --dev` command above shows. That command does not necessarily move existing entries, so after the install, check `package.json` and make sure both packages are in `devDependencies` and not in `dependencies`.

**lightningcss override:** the official docs state that a compatible `lightningcss` version override is necessary for deserialization, but they do not give a current exact version. At migration time, get the compatible value from the current migration guide and add it as a `resolutions`/`overrides` entry in `package.json`. Do not use an old hardcoded value.

- autoprefixer is not needed in Expo because of lightningcss
- After you change the config, restart Metro with a clear cache: `bunx expo start --clear`

## Configuration Files (v5)

### Metro Config (v5)

Update `metro.config.js`. `withNativewind` takes only the Metro config (no second options argument, and no v4 `input` option):

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

### PostCSS Config (v5)

Create `postcss.config.mjs`:

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### Global CSS (v5)

Update the root `global.css` (keep utilities unlayered so React Native Web defaults do not override them). It must include `@import "nativewind/theme";`. Import it once in `app/_layout.tsx`:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

/* Platform-specific font families */
@media android {
  :root {
    --font-mono: monospace;
    --font-rounded: normal;
    --font-serif: serif;
    --font-sans: normal;
  }
}

@media ios {
  :root {
    --font-mono: ui-monospace;
    --font-serif: ui-serif;
    --font-sans: system-ui;
    --font-rounded: ui-rounded;
  }
}
```

## IMPORTANT: No NativeWind Babel Config (v5)

With Tailwind v4 and NativeWind v5, you do NOT need Babel config for Tailwind. Remove both `nativewind/babel` and the `jsxImportSource: "nativewind"` option from the `babel-preset-expo` preset. Keep any other `babel-preset-expo` options the app needs (for example, this repository's `unstable_transformImportMeta: true`):

```js
// DELETE babel.config.js if it only contains NativeWind config
// The following is NO LONGER needed:
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [
//       ["babel-preset-expo", { jsxImportSource: "nativewind" }],
//       "nativewind/babel",
//     ],
//   };
// };
```

## CSS Component Wrappers (v5)

Since react-native-css requires explicit CSS element wrapping, create reusable components:

### Main Components (`src/tw/index.tsx`) (v5)

```tsx
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
  return useCssElement(RouterLink, props, { className: "style" });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentClassName?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(Animated.ScrollView, props, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>
) {
  const { underlayColor, ...style } = StyleSheet.flatten(props.style) || {};
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>
) => {
  return useCssElement(XXTouchableHighlight, props, { className: "style" });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";
```

### Image Component (`src/tw/image.tsx`) (v5)

```tsx
import { useCssElement } from "react-native-css";
import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Image as RNImage } from "expo-image";

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

export type ImageProps = React.ComponentProps<typeof Image>;

function CSSImage(props: React.ComponentProps<typeof AnimatedExpoImage>) {
  // @ts-expect-error: Remap objectFit style to contentFit property
  const { objectFit, objectPosition, ...style } =
    StyleSheet.flatten(props.style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={
        typeof props.source === "string" ? { uri: props.source } : props.source
      }
      // @ts-expect-error: Style is remapped above
      style={style}
    />
  );
}

export const Image = (
  props: React.ComponentProps<typeof CSSImage> & { className?: string }
) => {
  return useCssElement(CSSImage, props, { className: "style" });
};

Image.displayName = "CSS(Image)";
```

### Animated Components (`src/tw/animated.tsx`) (v5)

```tsx
import * as TW from "./index";
import RNAnimated from "react-native-reanimated";

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
};
```

## Usage (v5)

Import CSS-wrapped components from your tw directory:

```tsx
import { View, Text, ScrollView, Image } from "@/tw";

export default function MyScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 gap-4">
        <Text className="text-xl font-bold text-gray-900">Hello Tailwind!</Text>
        <Image
          className="w-full h-48 rounded-lg object-cover"
          source={{ uri: "https://example.com/image.jpg" }}
        />
      </View>
    </ScrollView>
  );
}
```

## Custom Theme Variables (v5)

Add custom theme variables in your global.css using `@theme`:

```css
@layer theme {
  @theme {
    /* Custom fonts */
    --font-rounded: "SF Pro Rounded", sans-serif;

    /* Custom line heights */
    --text-xs--line-height: calc(1em / 0.75);
    --text-sm--line-height: calc(1.25em / 0.875);
    --text-base--line-height: calc(1.5em / 1);

    /* Custom leading scales */
    --leading-tight: 1.25em;
    --leading-snug: 1.375em;
    --leading-normal: 1.5em;
  }
}
```

## Platform-Specific Styles (v5)

Use platform media queries for platform-specific styling:

```css
@media ios {
  :root {
    --font-sans: system-ui;
    --font-rounded: ui-rounded;
  }
}

@media android {
  :root {
    --font-sans: normal;
    --font-rounded: normal;
  }
}
```

## Apple System Colors with CSS Variables (v5)

Create a CSS file for Apple semantic colors:

```css
/* src/css/sf.css */
@layer base {
  html {
    color-scheme: light;
  }
}

:root {
  /* Accent colors with light/dark mode */
  --sf-blue: light-dark(rgb(0 122 255), rgb(10 132 255));
  --sf-green: light-dark(rgb(52 199 89), rgb(48 209 89));
  --sf-red: light-dark(rgb(255 59 48), rgb(255 69 58));

  /* Gray scales */
  --sf-gray: light-dark(rgb(142 142 147), rgb(142 142 147));
  --sf-gray-2: light-dark(rgb(174 174 178), rgb(99 99 102));

  /* Text colors */
  --sf-text: light-dark(rgb(0 0 0), rgb(255 255 255));
  --sf-text-2: light-dark(rgb(60 60 67 / 0.6), rgb(235 235 245 / 0.6));

  /* Background colors */
  --sf-bg: light-dark(rgb(255 255 255), rgb(0 0 0));
  --sf-bg-2: light-dark(rgb(242 242 247), rgb(28 28 30));
}

/* iOS native colors via platformColor */
@media ios {
  :root {
    --sf-blue: platformColor(systemBlue);
    --sf-green: platformColor(systemGreen);
    --sf-red: platformColor(systemRed);
    --sf-gray: platformColor(systemGray);
    --sf-text: platformColor(label);
    --sf-text-2: platformColor(secondaryLabel);
    --sf-bg: platformColor(systemBackground);
    --sf-bg-2: platformColor(secondarySystemBackground);
  }
}

/* Register as Tailwind theme colors */
@layer theme {
  @theme {
    --color-sf-blue: var(--sf-blue);
    --color-sf-green: var(--sf-green);
    --color-sf-red: var(--sf-red);
    --color-sf-gray: var(--sf-gray);
    --color-sf-text: var(--sf-text);
    --color-sf-text-2: var(--sf-text-2);
    --color-sf-bg: var(--sf-bg);
    --color-sf-bg-2: var(--sf-bg-2);
  }
}
```

Then use in components:

```tsx
<Text className="text-sf-text">Primary text</Text>
<Text className="text-sf-text-2">Secondary text</Text>
<View className="bg-sf-bg">...</View>
```

## Using CSS Variables in JavaScript (v5)

Use the `useCSSVariable` hook:

```tsx
import { useCSSVariable } from "@/tw";

function MyComponent() {
  const blue = useCSSVariable("--sf-blue");

  return <View style={{ borderColor: blue }} />;
}
```

## Key Differences from NativeWind v4 / Tailwind v3 (v5)

1. **No NativeWind Babel config** - Remove `nativewind/babel` and `jsxImportSource`; configuration is now CSS-first
2. **PostCSS plugin** - Uses `@tailwindcss/postcss` instead of `tailwindcss`
3. **CSS imports** - Use `@import "tailwindcss/..."` and `@import "nativewind/theme"` instead of `@tailwind` directives
4. **Theme config** - Use `@theme` in CSS instead of `tailwind.config.js`
5. **Component wrappers** - Must wrap components with `useCssElement` for className support
6. **Metro config** - Use `withNativewind(config)` with no options (no `input`)
7. **lightningcss override** - Needed; get the compatible version from the current migration guide

## Troubleshooting (v5)

### Styles not applying (v5)

1. Ensure you have the CSS file imported in your app entry
2. Check that components are wrapped with `useCssElement`
3. Verify Metro config has `withNativewind` applied

### Platform colors not working (v5)

1. Use `platformColor()` in `@media ios` blocks
2. Fall back to `light-dark()` for web/Android

### TypeScript errors (v5)

Add className to component props:

```tsx
type Props = React.ComponentProps<typeof RNView> & { className?: string };
```
