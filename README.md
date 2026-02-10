# Expo Router Template

A production-ready Expo template with file-based routing, authentication flow, data fetching, and a clean modern design system powered by NativeWind.

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| [Expo](https://docs.expo.dev/) | 54 | Cross-platform framework |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 6 | File-based navigation |
| [React Native](https://reactnative.dev/) | 0.81 | Mobile runtime |
| [React](https://react.dev/) | 19 | UI library |
| [NativeWind](https://www.nativewind.dev/) | 4 | Tailwind CSS for React Native |
| [TanStack Query](https://tanstack.com/query/) | 5 | Data fetching & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | State management |
| [React Hook Form](https://www.react-hook-form.com/) | 7 | Form handling |
| [Zod](https://zod.dev/) | 3 | Schema validation |
| [FlashList](https://shopify.github.io/flash-list/) | 2 | Performant lists |
| TypeScript | 5 | Type safety |

## Features

- **Auth flow** — Protected routes with `(auth)` / `(app)` route groups and Zustand-based auth store
- **Drawer + Tabs** — Drawer navigation wrapping bottom tab navigator with Home, Counter, and Details tabs
- **Data fetching** — TanStack Query with query key factory, pull-to-refresh, and refetch-on-focus
- **State management** — Zustand stores for auth and app state (counter)
- **Form validation** — React Hook Form with Zod schema resolver
- **Design system** — Semantic color tokens, Button/Input components, NativeWind-only styling

## Project Structure

```
app/
  _layout.tsx                 Root: providers + auth redirect
  (auth)/
    _layout.tsx               Stack (headerShown: false)
    login.tsx                 Login screen
  (app)/
    _layout.tsx               Drawer with styled menu + logout
    (tabs)/
      _layout.tsx             Tabs: Home, Counter, Details
      index.tsx               Home — Pokemon list (FlashList)
      counter.tsx             Counter — Zustand demo
      details.tsx             Details — URL params demo
  [...unmatched].tsx          404 fallback
src/
  api/                        API config & query factories
  components/                 Button, Input
  hooks/                      usePokemon, useRefreshByUser, useRefreshOnFocus, useOnlineManager
  models/                     TypeScript types
  stores/                     useAuthStore, useAppStore
  utils/                      Constants, helpers (cn)
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/toyamarodrigo/expo-router-template
cd expo-router-template
```

Install dependencies:

```bash
bun install
```

Run the application:

```bash
bun start
```

## Demo Credentials

| Username | Password |
|----------|----------|
| `demo` | `password` |

Login with these credentials to access the app. Invalid credentials will show an error message.
