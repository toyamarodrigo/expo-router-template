# Plan de migración: Expo SDK 54 → 57

> Fecha: 2026-09-28 · Estado: **aprobado** · Estrategia: **incremental por SDK**, una branch (`chore/sdk-57-migration`), un commit por fase, un PR al final.

## Contexto

| | Actual | Objetivo |
|---|---|---|
| Expo SDK | 54 | **57** (30/06/2026) |
| React Native | 0.81.5 | **0.86.x** |
| React / React DOM | 19.1.0 | **19.2.3** |
| Expo Router | 6.0 | **57.x** (sin dependencia de React Navigation) |
| Reanimated / Worklets | 4.1 / 0.5 | **4.5 / 0.10** |
| Node | sin fijar | **24 LTS** |
| TypeScript | 5.8 | **6.0** |
| ESLint | 8 + `.eslintrc.js` (EOL) | **9 + flat config** + Prettier |
| NativeWind / Tailwind | 4.1 / 3.4 | **4.2.7 / 3.4** |
| HTTP | axios | **`fetch` + Zod 4** |
| Zod | 3 | **4** |
| Iconos | `@expo/vector-icons` | **`@react-native-vector-icons/material-design-icons`** + wrapper `Icon` |
| Devtools Query | `@dev-plugins/react-query` 0.2 + `@tanstack/react-query-devtools` (sin uso) | **`@dev-plugins/react-query` 0.4** |

SDK 58 está en beta (15/09/2026, RN 0.88 RC). Queda para la [Fase 10](#fase-10--backlog-sdk-58).

### Progreso

- [x] Fase 0 — limpieza previa (+ fixes web: `import.meta`, auth storage)
- [x] Fase 1 — SDK 55
- [x] Fase 2 — SDK 56 + router sin React Navigation
- [x] Fase 3 — SDK 57 (smoke iOS pendiente: requiere Xcode 26.4+)
- [x] Fase 4 — ESLint 9 flat config (adelantada)
- [x] Fase 5 — librerías
- [x] Fase 6 — React Compiler
- [x] Fase 7 — EAS
- [x] Fase 8 — tests + CI + Dependabot
- [ ] Fase 9 — bugs y cierre

### Decisiones

| Tema | Decisión | Motivo |
|---|---|---|
| Objetivo | SDK 57 estable | Un template parte de versiones estables. |
| Propósito | Template personal **con demos** (Pokémon, counter, auth demo, drawer + tabs) | Las demos muestran los patrones. Los identificadores `com.toyama.rodrigo.*` no cambian. |
| HTTP | Quitar axios. `fetch` + schemas Zod 4 en el borde de la API; tipos con `z.infer` | Un solo GET; menos bundle; una fuente de verdad para tipos. Va en Fase 5, después de que `expo/fetch` sea global (SDK 56). |
| Estilos | NativeWind 4.2.7 + Tailwind 3.4 + `tailwind-merge@^2` | 4.2.7 soporta SDK 57. v5 sigue en RC. |
| Lint | ESLint 9 flat + Prettier | Ver [ADR 0001](adr/0001-eslint-over-biome.md). ESLint 10 bloqueado por `eslint-plugin-react`. |
| Iconos | Paquete scoped + codemod + wrapper `src/components/icon.tsx` | `@expo/vector-icons` se va a deprecar. El wrapper permite cambiar a `expo-symbols` después. |
| Devtools | `@dev-plugins/react-query` 0.4; quitar `@tanstack/react-query-devtools` | Un cambio de una línea. Rozenite queda en backlog. |
| Navegación | JS tabs + drawer custom. Imports migrados **a mano** (sin codemod) | NativeTabs es beta en SDK 57. El codemod tiene errores conocidos (expo/expo#46481, #49808). |
| Node | 24 LTS (`.nvmrc`, `engines`, CI) | Cumple SDK 55-58. |
| Skills | `.agents/skills` es la fuente. Se mantiene el symlink `.claude/skills`. Se elimina `.cursor/skills` | No se usa Cursor. |
| CI | GitHub Actions, actions fijadas por SHA + Dependabot | Protección de supply chain. |
| Alcance | Sin demos nuevas (inner navigation, bottom sheet, dialog) | La migración ya es grande. |
| Idioma | README y ADR en inglés; este plan en español | El README es la cara pública del template. |

### Nota de ejecución

Los comandos locales de instalación, validación y Git los ejecuta el coordinador en esta sesión. Opus implementa editando archivos y Fable planifica y revisa. Ninguno de los comandos de este plan necesita privilegios elevados. La excepción es instalar o actualizar Xcode, que necesita admin; gestionarlo con IT.

Flujo por fase: (1) el coordinador instala dependencias → (2) Opus implementa → (3) el coordinador ejecuta checks y smoke test → (4) Fable revisa → (5) commit.

---

## Fase 0 — Preparación y quick wins (sobre SDK 54)

**Objetivo:** baseline verde y arreglos independientes del SDK.

### 0.1 Requisitos de entorno
- Node **24 LTS**. Agregar `.nvmrc` (`24`) y `"engines": { "node": ">=24" }` en `package.json`.
- Xcode **26.4+** (requerido en SDK 56). iOS deployment target mínimo **16.4**.
- Bun actualizado (el repo usa `bun.lock`).

### 0.2 Baseline
```bash
# Ejemplo
git checkout -b chore/sdk-57-migration
bun install
npx expo-doctor@latest
npx tsc --noEmit
bun run lint
```
Smoke manual (iOS, Android, web): login `demo/password` → Home (lista) → detalle Pokémon → Counter → Details → drawer → logout.

### 0.3 Seguridad (obligatorio)
- **`.env.example`:** eliminar `EXPO_PUBLIC_CLIENT_SECRET`. Toda variable `EXPO_PUBLIC_*` queda dentro del bundle JS y cualquier persona con la app la puede leer. Los secretos van en un backend / API routes (`+api.ts`) o en EAS environment variables para build time. Nunca en el cliente.
- Documentar esta regla en el README.
- Verificar que `.env.local` nunca se commiteó (`git log --all -- .env.local`). Si alguna vez tuvo un secreto real con prefijo `EXPO_PUBLIC_`, **rotarlo** y reportarlo a securityteam@urbetrack.com.
- Marcar las credenciales de `use-auth-store.ts` (`demo/password`) como **solo demo**.

### 0.4 `tailwind-merge`
`tailwind-merge@3` solo soporta Tailwind v4. Con Tailwind 3.4, `cn()` resuelve mal algunas clases.
```bash
# Ejemplo
bun add tailwind-merge@^2
```

### 0.5 Babel / tsconfig / convenciones
- Quitar `react-native-reanimated/plugin`: `babel-preset-expo` ya agrega el plugin de worklets.
- Quitar `babel-plugin-module-resolver`: Metro resuelve los `paths` de `tsconfig.json`.
- `tsconfig.json`: `noUnusedLocals: true`; quitar `experimentalDecorators`, `sourceMap`, `allowSyntheticDefaultImports`, `baseUrl` (con `paths` relativos `./`) y los alias `@layouts` y `@adapters` (las carpetas no existen). Así la Fase 2 (TS 6) no necesita cambios en `tsconfig.json`.
- `Platform.OS` → `process.env.EXPO_OS` en `use-online-manager.ts` y `login.tsx`.

### 0.6 Limpieza de repo
- Borrar `.claude/plans/iterative-fluttering-creek.md` (plan viejo y obsoleto).
- Borrar `.cursor/skills`.

**Checkpoint:** baseline de 0.2 igual o mejor. Commit: `chore: pre-migration cleanup`.

---

## Fase 1 — SDK 54 → 55 (RN 0.83, React 19.2)

```bash
# Ejemplo
npx expo install expo@^55.0.0 --fix
npx expo-doctor@latest
```

- **`app.json`:**
  - Eliminar `"newArchEnabled": true` (la Legacy Architecture ya no existe).
  - Eliminar `"assetBundlePatterns"` (obsoleto).
  - Mover `splash` al plugin `expo-splash-screen` (`image`, `resizeMode`, `backgroundColor`, `imageWidth: 200`).
- **Versionado:** desde SDK 55 los paquetes Expo usan major = SDK (`expo-router@~55.x`). Revisar que no queden rangos `^` en paquetes `expo-*`.
- **EAS Update:** `eas update` exige `--environment`. Actualizar el README.
- **`expo-status-bar`:** `backgroundColor`/`translucent` no funcionan con edge-to-edge (verificar que no se usen).

**Checkpoint:** doctor, tsc, lint, smoke en iOS/Android/web. Commit: `chore(deps): expo sdk 55`.

---

## Fase 2 — SDK 55 → 56 (RN 0.85, TS 6) — la fase de más riesgo

```bash
# Ejemplo
npx expo install expo@^56.0.0 --fix
npx expo-doctor@latest
```

### 2.1 Expo Router sin React Navigation (migración manual)

| Archivo | Import actual | Import nuevo |
|---|---|---|
| `app/(app)/_layout.tsx` | `DrawerContentScrollView`, `DrawerContentComponentProps` de `@react-navigation/drawer` | `expo-router/drawer` |
| `app/(app)/(tabs)/index.tsx`, `details.tsx`, `counter.tsx` | `DrawerActions` de `@react-navigation/native` | `expo-router/react-navigation` |
| `src/hooks/use-refresh-on-focus.ts` | `useFocusEffect` de `@react-navigation/native` | `expo-router` |
| `app/(app)/(tabs)/_layout.tsx` | `Tabs` de `expo-router` | verificar que siga como JS tabs (`tabBarStyle`, `href` con params) |

Después, quitar `@react-navigation/drawer` y `@react-navigation/native` de `package.json`. Mantener `react-native-gesture-handler`, `react-native-reanimated` y `react-native-worklets` (el drawer los necesita).

### 2.2 Otros breaking changes
- **`expo/fetch` es el `fetch` global.** Axios usa XHR (no le afecta). Se reemplaza en Fase 5.
- **`@expo/vector-icons`** ya no viene con `expo`. Sigue declarado explícito hasta la Fase 5.
- **iOS 16.4 / Xcode 26.4.** `ios/` está en `.gitignore` (CNG): regenerar con `npx expo prebuild --clean`.

### 2.3 TypeScript 6
- `baseUrl` (deprecado en TS 6) ya se quitó en Fase 0.
- Verificar `@total-typescript/ts-reset` con TS 6.

**Checkpoint:** doctor, tsc, lint, smoke completo con foco en **drawer** (abrir desde el botón menú, navegar, logout) y **tabs**. Commit: `chore(deps): expo sdk 56 + router decoupling`.

---

## Fase 3 — SDK 56 → 57 (RN 0.86)

```bash
# Ejemplo
npx expo install expo@^57.0.0 --fix
npx expo-doctor@latest
npx expo prebuild --clean
```
- Reanimated 4.5 / Worklets 0.10 / Gesture Handler 2.32 (vía `--fix`).
- Corrige la regresión de memoria de Hermes V1 de SDK 56.

**Checkpoint:** igual que las fases anteriores. Commit: `chore(deps): expo sdk 57`.

---

## Fase 4 — Tooling: ESLint 9 flat config

### 4.1 Dependencias
Quitar: `eslint-plugin-node`, `eslint-config-standard`, `eslint-plugin-promise`, `@eslint/compat`, `ts-node`, `@types/react-test-renderer`, `@types/jest` (vuelve en Fase 8), `@babel/core`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import` (vienen con `eslint-config-expo`).

Actualizar: `eslint@^9`, `eslint-config-expo@~57`, `prettier`, `eslint-plugin-prettier`, `eslint-config-prettier`, `@tanstack/eslint-plugin-query`.

### 4.2 `eslint.config.js` (reemplaza `.eslintrc.js`)
- Base: `eslint-config-expo/flat` + `@tanstack/eslint-plugin-query` `flat/recommended` + `eslint-plugin-prettier/recommended`.
- Portar 1:1 las reglas custom: `no-console` (permite `warn`/`error`), `react/prop-types` off, `react/no-unescaped-entities` off, `@typescript-eslint/no-unused-vars` con `_`, `import/order`, `react/self-closing-comp`, `react/jsx-sort-props`, `padding-line-between-statements`, `@tanstack/query/exhaustive-deps` y `stable-query-client` como error.
- Mover las opciones de Prettier a `.prettierrc`.
- `eslint-plugin-react-native`: quitar si ninguna regla lo usa.

### 4.3 Scripts
```json
"lint": "expo lint",
"lint:fix": "expo lint --fix",
"typecheck": "tsc --noEmit",
"test": "jest",
"doctor": "bunx expo-doctor@latest"
```

> Nota: la Fase 4 se ejecutó antes de la Fase 2 (sobre SDK 55), porque la Fase 2 necesita Xcode 26.4+. `eslint-config-expo` queda en `~55` y sube con `expo install --fix` en las Fases 2 y 3.

**Checkpoint:** `bun run lint` sin errores nuevos. Commit: `chore(lint): eslint 9 flat config`.

---

## Fase 5 — Librerías

### 5.1 Iconos
```bash
# Ejemplo
bun add @react-native-vector-icons/material-design-icons
npx @react-native-vector-icons/codemod
bun remove @expo/vector-icons
```
- Crear `src/components/icon.tsx` y usarlo en los 7 archivos que hoy importan `MaterialCommunityIcons`.
- Tipo del nombre: `ComponentProps<typeof MaterialDesignIcons>["name"]`.
- Revisar si el paquete necesita config plugin de fuentes.

### 5.2 HTTP: axios → `fetch` + Zod 4
```bash
# Ejemplo
bun add zod@^4 @hookform/resolvers@latest
bun remove axios
```
- `src/api/http.ts`: helper `getJson(url, schema)` que valida `response.ok`, parsea JSON y valida con Zod. Error tipado (`HttpError`).
- `src/api/api.pokemon.ts`: schemas Zod para lista y detalle. Tipos con `z.infer` en `src/models/`, reemplazando los tipos manuales.
- Un error de schema es un error de query (React Query lo muestra).
- Revisar que `zodResolver` tipe bien con `useForm<LoginForm>`.

### 5.3 Devtools
- `@dev-plugins/react-query@^0.4`. Quitar `@tanstack/react-query-devtools`.

### 5.4 Resto
Bump a la última minor/patch: `@tanstack/react-query`, `react-hook-form`, `zustand`, `@lukemorales/query-key-factory`, `nativewind@^4.2.7`, `postcss`, `prettier`. `@shopify/flash-list` y `@react-native-community/netinfo`: la versión de `expo install --fix`.

### Notas de ejecución
- **Iconos:** sin codemod; migración manual con el wrapper `Icon` / `IconName` (el paquete exporta `MaterialDesignIconsIconName`). La fuente carga con `expo-font`: no hace falta el config plugin.
- **`@tanstack/query-core` explícito:** `@lukemorales/query-key-factory` lo pide como peer y bun lo dejó en una versión vieja (dos `QueryClient` → error de tipos `#private`). Se declara directo con el mismo rango que `@tanstack/react-query`. Al subir react-query, subir los dos juntos.
- **Tipos reales de PokeAPI:** `next`, `previous` y la imagen pueden ser `null`. Los tipos manuales lo escondían.

**Checkpoint:** tsc, lint, smoke. Commit: `chore(deps): icons, fetch + zod 4, libs`.

---

## Fase 6 — React Compiler

```bash
# Ejemplo
npx expo install babel-plugin-react-compiler
```
- `app.json` → `"experiments": { "typedRoutes": true, "reactCompiler": true }`.
- Quitar la memoización manual (`memo(PokemonListItem)`, `useCallback` en `use-refresh-on-focus.ts` si el efecto no se dispara en cada render).
- Mantener `useState(() => new QueryClient(...))` (identidad estable).

**Checkpoint:** smoke + React DevTools. Commit: `feat: enable react compiler`.

**Notas de ejecución:**
- No hace falta instalar `babel-plugin-react-compiler`: en SDK 57 es dependencia directa de `babel-preset-expo`, y Metro lo activa con `experiments.reactCompiler`.
- Se quitó `memo(PokemonListItem)`. Se mantiene el `useCallback` de `use-refresh-on-focus.ts`: `useFocusEffect` exige un callback estable, y es mejor dejarlo explícito que depender de la memoización del compilador.

---

## Fase 7 — EAS / Updates

- `app.json`: `"runtimeVersion": { "policy": "fingerprint" }`.
- `eas.json`: subir `cli.version`; `"node": "24"` en los perfiles de build.
- Documentar `eas update --channel <x> --environment <y>`.

Commit: `chore(eas): fingerprint runtime policy`.

**Notas de ejecución:** `cli.version` `>= 24.8.0`. Node `24.21.0` exacto (la doc de EAS solo muestra versiones exactas) en un perfil `base` que los demás extienden. Comandos documentados en el README ("EAS Build & Update").

---

## Fase 8 — Tests + CI

### 8.1 Tests
```bash
# Ejemplo
bun expo install jest-expo jest @types/jest @testing-library/react-native
bun add -D @jest/globals@~29.7.0
```
- `jest.config.js` con preset `jest-expo` (ver notas de ejecución).
- Tests mínimos:
  - `src/api/api.pokemon.test.ts`: schemas y transformación con fixture (mock de `fetch`).
  - `src/stores/use-auth-store.test.ts`: login válido / inválido / logout (mock de `expo-secure-store`).
  - `__tests__/routing.test.tsx`: `renderRouter` de `expo-router/testing-library` con el root layout real (`AuthGate`) y stubs de login / home; sin sesión → `/login`; con sesión → `/` (tabs).
  - `__tests__/login.test.tsx`: errores de Zod con campos vacíos e `Invalid credentials`.

**Notas de ejecución:**
- **Tests de UI fuera de `app/`:** Expo Router trata cada archivo de `app/` como una ruta. Un `*.test.tsx` o una carpeta `__tests__/` dentro de `app/` entra en el bundle y en las typed routes. Por eso los tests de rutas y pantallas van en `__tests__/` en la raíz. Los tests unitarios de `src/` quedan junto al código.
- **Config de Jest (`jest.config.js`):** preset `jest-expo`; `setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]`; `testPathIgnorePatterns` para `node_modules/`, `ios/`, `android/`, `dist/` y `.expo/`.
- **Mocks globales (`jest.setup.ts`):** `expo-secure-store` (en memoria), `@react-native-community/netinfo` (mock oficial), `@dev-plugins/react-query` (no-op) y `global.css`.
- **CI:** `bun run test` corre entre `typecheck` y `doctor`.

Commit: `test: jest + api, store, router, login`.

### 8.2 CI
- `.github/workflows/ci.yml`: `pull_request` y `push` a `main`; `bun install --frozen-lockfile`, lint, typecheck, test, `expo-doctor`. Node desde `.nvmrc`.
- Actions **fijadas por SHA** con comentario de versión (`# v7.0.1`, `# v7.0.0`, `# v2.2.0`).
- `.github/dependabot.yml` con ecosistema `github-actions`.
- Sin secrets.
- Commit existente: `240a052 ci: lint, typecheck, doctor + dependabot`.

---

## Fase 9 — Bugs y cierre

- **Hidratación del auth store:** `AuthGate` redirige antes de que `persist` lea SecureStore (flash de login). Esperar `useAuthStore.persist.hasHydrated()` y mantener el splash con `SplashScreen.preventAutoHideAsync()`.
- ~~**`query-factory.ts`:** simplificar la key a `{ limit, offset }`~~ (hecho en Fase 5, junto con `fetch` + Zod).
- **README (inglés):** requisitos (Node 24, Xcode 26.4, iOS 16.4), versiones, scripts, regla de `EXPO_PUBLIC_*`.
- **`TODO.md`:** marcar React Query detail, ESLint y Tsconfig como hechos.
- **Skills:** actualizar `.agents/skills` (en especial `upgrading-expo` y `expo-tailwind-setup`).
- Validar el static export: `npx expo export -p web`.

Commit: `chore: post-migration fixes and docs`.

---

## Fase 10 — Backlog: SDK 58

**No se ejecuta en esta branch.** Criterios de entrada: SDK 58 estable y RN 0.88 estable.

- SDK 58 (Node ^22.13 ya cubierto; ciclo de vida por escenas en iOS 27).
- NativeTabs (estable en SDK 58 como `expo-router/native-tabs`).
- NativeWind 5 + Tailwind 4 (cuando sea estable).
- Rozenite (`@rozenite/tanstack-query-plugin`) si `@dev-plugins/react-query` deja de funcionar.
- `expo-symbols` dentro del wrapper `Icon` (cuando salga de beta).
- ESLint 10 (cuando `eslint-plugin-react` lo soporte).
- Demos nuevas del `TODO.md` (inner navigation, bottom sheet, dialog), posiblemente con Expo UI.

---

## Checklist de verificación (en cada fase)

- [ ] `npx expo-doctor@latest` sin errores
- [ ] `bun run typecheck` sin errores
- [ ] `bun run lint` sin errores
- [ ] `bun run test` verde (desde Fase 8)
- [ ] iOS (simulador, dev client): login → lista → detalle → counter → details → drawer → logout
- [ ] Android: mismo flujo + edge-to-edge
- [ ] Web: `expo start --web` y `expo export -p web`
- [ ] Pull-to-refresh y refetch al volver a foco en Home
- [ ] Modo avión → online → React Query reintenta
- [ ] Reiniciar la app con sesión → sin flash de login (después de Fase 9)

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Drawer custom en Router 56 | Media | `expo-router/drawer` re-exporta `DrawerContentScrollView`; fallback a `ScrollView` + safe area |
| `@dev-plugins/react-query` con poco mantenimiento | Media | Rozenite (Fase 10) |
| Nombres de iconos distintos | Baja | Wrapper `Icon` + tsc |
| Regresión de Hermes V1 en SDK 56 | Media | Fase 3 inmediatamente después |
| React Compiler rompe `useFocusEffect` | Baja | Mantener `useCallback` en ese hook |
| Schemas Zod demasiado estrictos para PokeAPI | Baja | Validar solo los campos que usa la UI |

## Referencias

- [Expo SDK 55](https://expo.dev/changelog/sdk-55) · [SDK 56](https://expo.dev/changelog/sdk-56) · [SDK 57](https://expo.dev/changelog/sdk-57) · [SDK 58 beta](https://expo.dev/changelog/sdk-58-beta)
- [Migrar Expo Router SDK 55 → 56](https://docs.expo.dev/router/migrate/sdk-55-to-56/)
- [Drawer (Expo Router)](https://docs.expo.dev/router/advanced/drawer/)
- [Using ESLint and Prettier (Expo)](https://docs.expo.dev/guides/using-eslint/)
- [Icons (Expo)](https://docs.expo.dev/guides/icons/)
- [React Compiler (Expo)](https://docs.expo.dev/guides/react-compiler/)
- [NativeWind 4.2.7](https://github.com/nativewind/nativewind/releases/tag/nativewind%404.2.7)
