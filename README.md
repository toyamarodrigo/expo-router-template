# Expo Router Template

A production-ready Expo SDK 57 template with file-based routing, a persisted authentication flow, typed data fetching, and a clean design system powered by NativeWind.

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| [Expo](https://docs.expo.dev/) | 57 | Cross-platform framework |
| [Expo Router](https://docs.expo.dev/router/introduction/) | 57 | File-based navigation (drawer + tabs, typed routes) |
| [React Native](https://reactnative.dev/) | 0.86 | Mobile runtime |
| [React](https://react.dev/) | 19.2 | UI library, with [React Compiler](https://docs.expo.dev/guides/react-compiler/) |
| [NativeWind](https://www.nativewind.dev/) / Tailwind CSS | 4.2 / 3.4 | Tailwind CSS for React Native |
| [TanStack Query](https://tanstack.com/query/) | 5 | Data fetching & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | State management |
| [React Hook Form](https://www.react-hook-form.com/) | 7 | Form handling |
| [Zod](https://zod.dev/) | 4 | Schema validation (forms and API responses) |
| [FlashList](https://shopify.github.io/flash-list/) | 2 | Performant lists |
| [Material Design Icons](https://github.com/oblador/react-native-vector-icons) | 13 | Icons (`@react-native-vector-icons/material-design-icons`) |
| TypeScript | 6 | Type safety |
| ESLint + Prettier | 9 + 3 | Linting (flat config) and formatting |
| Jest + Testing Library | 29 + 13 | Unit, screen, and routing tests |

## Requirements

- **Node 24** (see `.nvmrc`; `package.json` requires `>=24`)
- **Bun** (the repo uses `bun.lock`; CI uses Bun 1.2.19)
- **Xcode 26.4+** for iOS builds (minimum iOS deployment target **16.4**)
- Android Studio / Android SDK for Android builds
- A development build for full native development: the app includes `expo-dev-client`. The documented Android smoke test used Expo Go and did not validate a dev-client build. The `ios/` and `android/` folders are not committed (Continuous Native Generation).

## Features

- **Auth flow**: `(auth)` / `(app)` route groups with an `AuthGate` in the root layout that redirects based on the Zustand auth store
- **Persisted session**: the auth store persists to `expo-secure-store` on native (`localStorage` on web, which is not encrypted). The native splash screen stays up until the session is restored, so no login screen flashes on restart
- **Drawer + Tabs**: a custom drawer (`expo-router/drawer`) wraps a bottom tab navigator with Home, Counter, and Details tabs
- **Data fetching**: TanStack Query with a query key factory, a Pokémon list and a Pokémon detail screen, pull-to-refresh, refetch-on-focus, and an online manager connected to NetInfo
- **State management**: Zustand stores for auth and app state (counter)
- **Form validation**: React Hook Form with a Zod schema resolver
- **Error handling**: a root `ErrorBoundary` with a retry fallback, and an inline error state with a retry action on the Pokémon detail screen
- **Design system**: semantic color tokens, `Button` / `Input` / `Icon` components, NativeWind-only styling
- **Tooling**: React Compiler, typed routes, strict TypeScript with path aliases, ESLint 9 flat config, Jest, and GitHub Actions CI

## Project Structure

```
app/
  _layout.tsx                 Root: QueryClient, devtools, online manager, AuthGate (splash + redirect + ErrorBoundary)
  (auth)/
    _layout.tsx               Stack (headerShown: false)
    login.tsx                 Login screen
  (app)/
    _layout.tsx               Drawer with styled menu + logout
    (tabs)/
      _layout.tsx             Tabs: Home, Counter, Details
      index.tsx               Home: Pokémon list (FlashList)
      counter.tsx             Counter: Zustand demo
      details.tsx             Details: URL params demo
    pokemon/
      [id].tsx                Pokémon detail (React Query)
  [...unmatched].tsx          404 fallback
src/
  api/                        fetch + Zod helper (http.ts), Pokémon API, query key factory
  components/                 Button, Input, Icon, ErrorBoundary
  hooks/                      usePokemonList, usePokemonDetail, useRefreshByUser, useRefreshOnFocus, useOnlineManager
  models/                     Zod schemas and inferred types
  stores/                     useAuthStore, useAppStore
  utils/                      Constants, helpers (cn)
__tests__/                    Screen and routing tests
docs/
  adr/                        Architecture decision records
  agents/                     Agent workflow docs (issue tracker, triage labels, domain)
  sdk-57-migration.md         Expo SDK 54 → 57 migration plan
```

Path aliases (`tsconfig.json`): `@components/*`, `@stores/*`, `@utils/*`, `@api/*`, `@models/*`, `@hooks/*`, `@assets/*`, and `@/*` for the repo root.

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

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `bun start` | `expo start` | Start the dev server |
| `bun run android` | `expo run:android` | Build and run the Android app |
| `bun run ios` | `expo run:ios` | Build and run the iOS app |
| `bun run web` | `expo start --web` | Start the dev server for web |
| `bun run lint` | `expo lint` | Lint with ESLint |
| `bun run lint:fix` | `expo lint --fix` | Lint and fix problems |
| `bun run typecheck` | `tsc --noEmit` | Type-check the project |
| `bun run test` | `jest` | Run the test suite |
| `bun run doctor` | `bunx expo-doctor@latest` | Check the project for dependency and config problems |

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It uses the Node version from `.nvmrc` and runs these steps in order:

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bun run typecheck`
4. `bun run test`
5. `bun run doctor`

Actions are pinned by commit SHA, and Dependabot keeps them up to date.

## Patterns

### API

`src/api/http.ts` exports `getJson(url, schema)`. It calls `fetch`, throws an `HttpError` when the response is not OK, and validates the JSON with a Zod schema. Types come from the schemas with `z.infer` (`src/models/`), so there is one source of truth. A schema error becomes a query error (see [Error boundary](#error-boundary) for how screens show it).

Queries are defined once in `src/api/query-factory.ts` with `@lukemorales/query-key-factory`, and hooks use them directly:

```ts
const { data } = useQuery(pokemonKeys.pokemon.detail(id));
```

> `@tanstack/query-core` is declared explicitly because `@lukemorales/query-key-factory` needs it as a peer. When you upgrade `@tanstack/react-query`, upgrade both together.

### Icons

Always import icons from `src/components/icon.tsx`, not from the icon package directly:

```tsx
import { Icon } from "@components/icon";

<Icon color="#64748B" name="home" size={20} />;
```

The wrapper is the single entry point, so you can change the icon set in one place. `IconName` gives typed icon names. The icon font loads at runtime through `expo-font`. The Material Design Icons package includes a config plugin for its `/static` import, but this template uses dynamic loading and does not need that plugin.

### Error boundary

`src/components/error-boundary.tsx` is a class component with an optional `fallback` prop. The default fallback shows the error message and a "Try Again" button. `AuthGate` in `app/_layout.tsx` wraps the routes with it, so the splash screen still hides when a route throws. For query failures, the Pokémon detail screen shows an inline error state with a retry action. The Home list screen has no explicit query-error state. If the first load fails, the screen shows the empty state, and the query fetches again when the tab gets focus again. Pull-to-refresh is available when a cached list has loaded.

### React Compiler

React Compiler is enabled with `experiments.reactCompiler` in `app.json`. In SDK 57, `babel-preset-expo` includes the compiler, so no extra Babel plugin is necessary. Do not add `memo`, `useMemo`, or `useCallback` by default. Keep manual memoization only where an API requires a stable reference (for example, the `useFocusEffect` callback in `use-refresh-on-focus.ts`) and keep the `QueryClient` in `useState(() => new QueryClient(...))`.

### Tests

- Screen and routing tests go in the root `__tests__/` folder. Expo Router treats every file in `app/` as a route, so do not put tests there.
- Unit tests go next to the code (for example, `src/api/api.pokemon.test.ts` and `src/stores/use-auth-store.test.ts`).
- Routing tests use `renderRouter` from `expo-router/testing-library` with the real root layout.
- `jest.setup.ts` mocks `expo-secure-store` (in memory), `expo-splash-screen`, NetInfo, `@dev-plugins/react-query`, and `global.css`.

## Demo Credentials

| Username | Password |
|----------|----------|
| `demo` | `password` |

Login with these credentials to access the app. Invalid credentials will show an error message.

> These credentials are hardcoded for the demo only. Replace the auth store with a real auth provider before shipping.

## Environment Variables

Expo CLI loads the `.env` files (for example, `.env.local`) when it starts. Only variables with the `EXPO_PUBLIC_` prefix go into the client bundle, and only when the code references them statically (for example, `process.env.EXPO_PUBLIC_<NAME>`). Expo does not inline dynamic access such as `process.env[name]`.

An inlined value is plain text in the JavaScript bundle, so anyone with the app or the website can read it. Use `EXPO_PUBLIC_*` variables only for public values (for example, a public API URL). Never use them for secrets (client secrets, API keys, tokens). Keep secrets on a backend or in an API route (`+api.ts`).

## Static Web Export

Static rendering is enabled, so the web export makes one HTML file for each route:

```bash
bun expo export --platform web
```

- The export loads the `.env` files before it bundles. It inlines each statically referenced `EXPO_PUBLIC_*` value into the exported JavaScript, so the rules in [Environment Variables](#environment-variables) also apply here.
- The output goes to `dist/`. `dist/` is in `.gitignore`, so do not commit it. Deploy it with your host instead.
- The export writes clean routes as `.html` files (for example, `/login` becomes `dist/login.html`, and `/pokemon/[id]` becomes `dist/pokemon/[id].html`). Your static host must rewrite clean URLs to these files. For example, with nginx:

```nginx
location / {
  try_files $uri $uri.html $uri/index.html /+not-found.html;
}
```

Dynamic routes (for example, `/pokemon/25`) also need a rewrite to their generated file (`/pokemon/[id].html`), unless you pre-render each path with `generateStaticParams`.

## EAS Build & Update

**First step for a new app:** `app.json` contains this template's EAS project ID in two places: `extra.eas.projectId` and `updates.url`. Replace both with your own project before you build or publish, or your app will request updates from the template's project. For example, remove both values, run `eas init` (sets `extra.eas.projectId`), and then run `eas update:configure` (sets `updates.url`), and check that both values use the same ID.

Build profiles (`development`, `preview`, `production`) live in `eas.json` and share a `base` profile that pins Node 24.

`runtimeVersion` uses the `fingerprint` policy: EAS computes it from the native layer (dependencies, config plugins, native config). An update only reaches builds with the same fingerprint, so a JS-only change ships as an update and a native change needs a new build.

```bash
eas build --profile preview --platform all
eas update --channel preview --environment preview --message "Describe the change"
```

`--environment` selects which EAS environment variables are loaded into the update bundle. Use the environment that matches the channel.
