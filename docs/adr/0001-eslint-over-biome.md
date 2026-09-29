# 0001 — ESLint 9 + Prettier instead of Biome

- Status: Accepted
- Date: 2026-09-28

## Context

The default preference for new projects is Biome. This template is an Expo app, and in Expo SDK 57:

- `expo lint` runs ESLint only. Expo has no official Biome guidance.
- `eslint-config-expo/flat` includes `eslint-plugin-react-hooks` v7, which has stable React Compiler rules. Biome's `useReactCompiler` is still a nursery rule.
- The template uses `@tanstack/eslint-plugin-query` rules (`exhaustive-deps`, `stable-query-client`) as errors. Biome has no equivalent.
- ESLint 10 is not usable yet: `eslint-plugin-react` 7.37.5 crashes on it (jsx-eslint/eslint-plugin-react#3977).

## Decision

Use ESLint 9 with flat config (`eslint-config-expo/flat`) and Prettier. Port the existing custom rules 1:1.

A hybrid (Biome for formatting, ESLint for rules) was rejected: two tools for little benefit in a small repo.

## Consequences

- Linting works with `expo lint` and follows the official Expo path.
- The repo differs from the default Biome preference.
- Revisit when one of these is true: Expo publishes Biome guidance, Biome has stable React Compiler rules and an equivalent of the TanStack Query rules, or ESLint 10 becomes usable (flat config makes that a version bump).
