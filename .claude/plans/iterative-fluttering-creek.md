# Expo Router Template Review

## Context

Full audit of the project template against best practices from the installed Expo skills (`vercel-react-native-skills`, `vercel-composition-patterns`, `building-native-ui`, `native-data-fetching`) and general React/TypeScript standards. The goal is to identify concrete issues to fix so this template serves as a solid foundation for new projects.

**What's already good:**
- Zustand store with proper selectors preventing re-renders (`counter.tsx:7-9`)
- `Pressable` used over `TouchableOpacity` (per `vercel-react-native-skills`)
- React Query with sensible `staleTime` config, `QueryClient` defined outside component
- Strict TypeScript + comprehensive ESLint (TanStack Query rules, React hooks rules)
- Clean barrel exports, path aliases, well-organized `src/` structure
- `useFocusEffect` used correctly over `useEffect` in `useRefreshOnFocus`
- New Architecture enabled, Expo SDK 54, React 19

---

## HIGH — Bugs & Anti-patterns

### 1. Fix Login form: replace `register()`+`setValue()` with `Controller` + zod
**File:** `app/(tabs)/index.tsx:32-53`
**Issue:** `register()` returns `ref`/`onChange`/`onBlur` props designed for web `<input>`. On React Native `<TextInput>`, these don't bind correctly — the form works only because `setValue()` is called manually on `onChangeText`, making `register()` a no-op that adds confusion.
**Fix:** Replace with `Controller` from `react-hook-form` + `zodResolver` from `@hookform/resolvers/zod`. Define a zod schema for validation (replacing the custom async resolver). Install `@hookform/resolvers` as a dependency. Convert styling to NativeWind `className`. Replace `Constants.statusBarHeight` with SafeAreaView.

### 2. Home screen: handle loading/error states
**File:** `app/(tabs)/home.tsx:6`
**Issue:** Only destructures `{ data }` from `usePokemonList()` — ignores `isLoading`, `isError`, `error`. No loading indicator, no error message. Users see "No data" while the API is still fetching.
**Fix:** Destructure and render loading/error states.

### 3. Home screen: use FlashList instead of `.map()`
**File:** `app/(tabs)/home.tsx:17`
**Issue:** `@shopify/flash-list` is already installed but unused. The Pokemon list uses `data.results.map()` which renders all items at once (no virtualization). The `vercel-react-native-skills` skill lists this as **CRITICAL priority**.
**Fix:** Replace the `.map()` with `<FlashList>` using `estimatedItemSize` and a memoized `renderItem`.

### 4. Replace axios with native fetch
**File:** `src/api/api.pokemon.ts`
**Issue:** The `native-data-fetching` skill explicitly says **"Avoid axios, prefer native fetch API"**. Axios adds ~13KB gzipped to the bundle for no benefit in this use case.
**Fix:** Rewrite API calls using `fetch` with proper `response.ok` checks and error handling. Remove `axios` from `package.json`.

---

## MEDIUM — Skill Violations & Cleanup

### 5. Use `process.env.EXPO_OS` instead of `Platform.OS`
**File:** `src/hooks/useOnlineManager.ts:9`
**Issue:** `building-native-ui` skill says to use `process.env.EXPO_OS` over `Platform.OS`.
**Fix:** `if (process.env.EXPO_OS !== "web")` — this gets inlined at build time (tree-shakeable).

### 6. Standardize on NativeWind across all screens
**Files:** All screen files in `app/(tabs)/`, `src/components/Button.tsx`
**Issue:** Template mixes `StyleSheet.create` and NativeWind `className` inconsistently. NativeWind is already configured.
**Decision:** Convert all screens and components to use NativeWind `className` exclusively. Remove `StyleSheet.create` usage. This showcases the NativeWind setup that's already in the template.

### 7. Wire up unused hooks in root layout
**Files:** `app/_layout.tsx`, `src/hooks/useAppState.ts`, `src/hooks/useOnlineManager.ts`
**Issue:** `useOnlineManager`, `useAppState`, `useRefreshByUser`, `useRefreshOnFocus` are defined but never called anywhere.
**Decision:** Wire them up in `app/_layout.tsx`:
- Call `useOnlineManager()` — enables React Query auto-refetch on network reconnect
- Call `useAppState()` with a callback that sets `focusManager.setFocused(true)` when app comes to foreground — enables auto-refetch on app focus
- `useRefreshByUser` and `useRefreshOnFocus` are per-query helpers — keep them available but don't wire globally (they're used per-screen with specific query refetch functions)
- Also update `useOnlineManager` to use `process.env.EXPO_OS` (item 5)

### 8. Remove unused `filters` param from query factory
**File:** `src/api/query-factory.ts:13`
**Issue:** `list: (filters: Pokemon[], ...)` — `filters` is in the queryKey but never used in the queryFn. This creates different cache entries for different filter arrays that all return the same data.
**Fix:** Remove `filters` param, simplify to `list: (limit: number, offset: number)`.

### 9. Clean up dependencies
**File:** `package.json`
**Changes:**
- **Remove** `axios` — replaced by native fetch (item 4)
- **Remove** `@tanstack/react-query-devtools` — web-only devtools, the `@dev-plugins/react-query` is the correct RN approach (already used)
- **Remove** `expo-constants` — no longer needed after replacing `Constants.statusBarHeight` with SafeAreaView
- **Keep** `zod` — will be used in login form validation (item 1)
- **Add** `@hookform/resolvers` — for zod integration with react-hook-form

### 10. Clean up empty placeholders
**Files:** `src/utils/helpers.ts`, `src/adapters/` (empty directory)
**Issue:** Empty files/dirs add noise for a template. Either add useful content or remove them.
**Fix:** Remove both.

---

## LOW — Config Hardening & Polish

### 11. Fix tsconfig contradiction: `strict: true` + `noImplicitAny: false`
**File:** `tsconfig.json:4,12`
**Issue:** `strict: true` enables `noImplicitAny`, but then `noImplicitAny: false` explicitly disables it. This undermines the point of strict mode.
**Fix:** Remove `"noImplicitAny": false` (or set to `true`). Also set `"noUnusedLocals": true` to catch dead variables.

### 12. Replace `Constants.statusBarHeight` with safe area
**File:** `app/(tabs)/index.tsx:76`
**Issue:** Uses `paddingTop: Constants.statusBarHeight` for status bar spacing. The `building-native-ui` skill recommends using `SafeAreaView` or `contentInsetAdjustmentBehavior="automatic"` on ScrollView instead.
**Fix:** Wrap in SafeAreaView or use ScrollView with `contentInsetAdjustmentBehavior`.

### 13. Tab icons missing `color` prop passthrough
**File:** `app/(tabs)/_layout.tsx:10-29`
**Issue:** Tab bar icons hardcode `color="black"`, ignoring the `color` prop passed by the tab bar (for active/inactive states).
**Fix:** `tabBarIcon: ({ color }) => <MaterialCommunityIcons color={color} .../>`.

### 14. Home screen copy says "Details page"
**File:** `app/(tabs)/home.tsx:15`
**Issue:** `<Text>This is the Details page of your app.</Text>` — copy-paste leftover from details screen.
**Fix:** Change to "Home" or remove.

### 15. Unused `linkButton` style in home.tsx
**File:** `app/(tabs)/home.tsx:44-48`
**Issue:** `styles.linkButton` is defined but never used.
**Fix:** Remove it.

---

## Execution Order

### Step 1 — Config & Dependencies
1. `tsconfig.json` — Remove `noImplicitAny: false`, set `noUnusedLocals: true`
2. `package.json` — Remove `axios`, `@tanstack/react-query-devtools`, `expo-constants`; add `@hookform/resolvers`
3. Run `npm install` / `bun install`

### Step 2 — API Layer
4. `src/api/api.pokemon.ts` — Replace axios with native fetch + error handling
5. `src/api/query-factory.ts` — Remove `filters` param

### Step 3 — Hooks
6. `src/hooks/useOnlineManager.ts` — Replace `Platform.OS` with `process.env.EXPO_OS`
7. `app/_layout.tsx` — Wire up `useOnlineManager()` + `useAppState()` with focusManager

### Step 4 — Screens (convert to NativeWind + fix issues)
8. `app/(tabs)/index.tsx` — Controller + zod, NativeWind, SafeAreaView
9. `app/(tabs)/home.tsx` — FlashList, loading/error states, NativeWind, fix copy
10. `app/(tabs)/details.tsx` — Convert to NativeWind
11. `app/(tabs)/counter.tsx` — Convert to NativeWind
12. `app/(tabs)/_layout.tsx` — Fix tab icon `color` passthrough
13. `src/components/Button.tsx` — Convert to NativeWind

### Step 5 — Cleanup
14. Delete `src/utils/helpers.ts` (empty)
15. Delete `src/adapters/` directory (empty)
16. Update barrel exports in `src/hooks/index.ts`, `src/utils/index.ts`

## Verification

1. `npx tsc --noEmit` — TypeScript compiles cleanly
2. `npx expo lint` — no ESLint errors
3. `npx expo start` — run on iOS simulator / web:
   - Login form validates with zod (shows required errors, submits on valid input)
   - Home screen shows loading indicator, then Pokemon list in FlashList
   - Counter increment/decrement still works
   - Details screen still shows route params
   - Tab icons change color on active/inactive state
   - App refetches data on returning from background (useAppState wired up)
4. Verify `axios` no longer in `node_modules` after reinstall
