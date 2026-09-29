---
name: upgrading-expo
description: Guidelines for upgrading Expo SDK versions and fixing dependency issues
version: 1.1.0
license: MIT
---

## References

- ./references/new-architecture.md -- SDK 53+: New Architecture migration guide
- ./references/react-19.md -- SDK 54+: React 19 changes (useContext → use, Context.Provider → Context, forwardRef removal)
- ./references/react-compiler.md -- SDK 54+: React Compiler setup and migration guide (SDK 57 config behavior)
- ./references/native-tabs.md -- SDK 55+: Native tabs changes (Icon/Label/Badge now accessed via NativeTabs.Trigger.\*)
- ./references/expo-av-to-audio.md -- Migrate audio playback and recording from expo-av to expo-audio
- ./references/expo-av-to-video.md -- Migrate video playback from expo-av to expo-video

## Beta/Preview Releases

Beta versions use `.preview` suffix (e.g., `55.0.0-preview.2`), published under `@next` tag.

Check if latest is beta: https://exp.host/--/api/v2/versions (look for `-preview` in `expoVersion`)

```bash
npx expo install expo@next --fix  # install beta
```

## Step-by-Step Upgrade Process

1. Upgrade Expo and dependencies

```bash
npx expo install expo@latest
npx expo install --fix
```

2. Run diagnostics: `npx expo-doctor`

3. Clear caches and reinstall

```bash
npx expo export -p ios --clear
rm -rf node_modules .expo
watchman watch-del-all
```

## SDK 55–57 Notes

This template's SDK 55 → 57 migration baseline pins **Node 24**. This is a template choice, not a universal Expo SDK requirement. Verify the minimum Node version for each target SDK.

| SDK    | Min iOS | Xcode |
| ------ | ------- | ----- |
| 55     | 15.1    | 26.2  |
| 56, 57 | 16.4    | 26.4  |

Values change between releases. Always check the target SDK docs: [Expo SDK version requirements](https://docs.expo.dev/versions/latest/).

- **Versioning (SDK 55+):** Expo packages follow the SDK major (for example, `expo-router@55.x` for SDK 55). Use `npx expo install --fix` to align them. Do not pin old majors by hand.
- **Expo Router (SDK 56):** move app imports from external `@react-navigation/*` specifiers to `expo-router` entry points. Mappings used in this template (see `docs/sdk-57-migration.md`):
  - Drawer APIs (for example, `DrawerContentScrollView`, `DrawerContentComponentProps`): `@react-navigation/drawer` → `expo-router/drawer`
  - `DrawerActions`: `@react-navigation/native` → `expo-router/react-navigation`
  - `useFocusEffect`: `@react-navigation/native` → `expo-router`

  For other APIs, check the target SDK docs for the exact entry point.
- **fetch (SDK 56):** Expo provides its fetch implementation as global `fetch`. Explicit `expo/fetch` imports are no longer necessary.
- **Icons (SDK 56):** `expo` no longer bundles `@expo/vector-icons`. Its deprecation is planned, not complete. For new code, use `expo-symbols` for SF Symbols (currently beta; check its status for the target SDK) or scoped `@react-native-vector-icons/*` packages for font icon sets.
- **React Compiler (SDK 57):** enable with `experiments.reactCompiler` in the app config. `babel-preset-expo` provides the compiler plugin; do not add it separately. See ./references/react-compiler.md.
- **TypeScript 6 (SDK 56+):** `baseUrl` is deprecated. Keep `paths` aliases relative (for example, `"@components/*": ["./src/components/*"]`) and remove `baseUrl`.
- **TanStack Query:** if a query-key factory declares `@tanstack/query-core` as a peer, keep `@tanstack/query-core` on the same version as `@tanstack/react-query`.

## Breaking Changes Checklist

- Check for removed APIs in release notes
- Update import paths for moved modules
- Review native module changes requiring prebuild
- Test all camera, audio, and video features
- Verify navigation still works correctly

## Prebuild for Native Changes

If upgrading requires native changes:

```bash
npx expo prebuild --clean
```

This regenerates the `ios` and `android` directories. Ensure the project is not a bare workflow app before running this command.

## Clear caches for bare workflow

- Clear the cocoapods cache for iOS: `cd ios && pod install --repo-update`
- Clear derived data for Xcode: `npx expo run:ios --no-build-cache`
- Clear the Gradle cache for Android: `cd android && ./gradlew clean`

## Housekeeping

- Review release notes for the target SDK version at https://expo.dev/changelog
- If using Expo SDK 54 or later, ensure react-native-worklets is installed — this is required for react-native-reanimated to work.
- React Compiler: see the SDK 57 note above and ./references/react-compiler.md.
- Delete sdkVersion from `app.json` to let Expo manage it automatically
- Remove implicit packages from `package.json`: `@babel/core`, `babel-preset-expo`, `expo-constants`.
- If the babel.config.js only contains 'babel-preset-expo', delete the file
- If the metro.config.js only contains expo defaults, delete the file

## Removed, Unbundled, or Deprecated Packages (Including Planned Deprecations)

| Old Package          | Replacement                                          |
| -------------------- | ---------------------------------------------------- |
| `expo-av`            | `expo-audio` and `expo-video`                        |
| `expo-permissions`   | Individual package permission APIs                   |
| `@expo/vector-icons` | Not bundled with `expo` since SDK 56; deprecation planned. Use `expo-symbols` (SF Symbols, beta) or scoped `@react-native-vector-icons/*` packages (font icon sets, e.g. `@react-native-vector-icons/material-design-icons`) |
| `AsyncStorage`       | `expo-sqlite/localStorage/install`                   |
| `expo-app-loading`   | `expo-splash-screen`                                 |
| expo-linear-gradient | experimental_backgroundImage + CSS gradients in View |

When migrating deprecated packages, update all code usage before removing the old package. For expo-av, consult the migration references to convert Audio.Sound to useAudioPlayer, Audio.Recording to useAudioRecorder, and Video components to VideoView with useVideoPlayer.

## expo.install.exclude

Check if package.json has excluded packages:

```json
{
  "expo": { "install": { "exclude": ["react-native-reanimated"] } }
}
```

Exclusions are often workarounds that may no longer be needed after upgrading. Review each one.

## Removing patches

Check if there are any outdated patches in the `patches/` directory. Remove them if they are no longer needed.

## Postcss

- `autoprefixer` isn't needed in SDK 53+. Remove it from dependencies and check `postcss.config.js` or `postcss.config.mjs` to remove it from the plugins list.
- Use `postcss.config.mjs` in SDK 53+.

## Metro

Remove redundant metro config options:

- resolver.unstable_enablePackageExports is enabled by default in SDK 53+.
- `experimentalImportSupport` is enabled by default in SDK 54+.
- `EXPO_USE_FAST_RESOLVER=1` is removed in SDK 54+.
- cjs and mjs extensions are supported by default in SDK 50+.
- Expo webpack is deprecated, migrate to [Expo Router and Metro web](https://docs.expo.dev/router/migrate/from-expo-webpack/).

## New Architecture

The new architecture is enabled by default, the app.json field `"newArchEnabled": true` is no longer needed as it's the default. Expo Go only supports the new architecture in SDK 53+. SDK 55+ has no Legacy Architecture.
