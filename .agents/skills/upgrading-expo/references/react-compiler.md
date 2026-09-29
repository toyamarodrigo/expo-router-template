# React Compiler

React Compiler is stable in Expo SDK 54 and later. It automatically memoizes components and hooks, so most manual `useMemo`, `useCallback`, and `React.memo` is not necessary.

## Enabling React Compiler

Add to the app config (`app.json` or `app.config.ts`):

```json
{
  "expo": {
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

In SDK 57, `experiments.reactCompiler` is the only switch. `babel-preset-expo` provides the compiler Babel plugin:

- Do not install or add `babel-plugin-react-compiler` separately.
- Do not add the compiler plugin to `babel.config.js`. If `babel.config.js` only contains `babel-preset-expo`, delete the file.

## What React Compiler Does

- Automatically memoizes components and values
- Eliminates unnecessary re-renders
- Works with idiomatic code without modifications

## Cleanup After Enabling

Once React Compiler is enabled, you can remove manual memoization that exists only for render performance:

```tsx
// Before (manual memoization)
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a), [a]);
const MemoizedComponent = React.memo(MyComponent);

// After (React Compiler handles it)
const value = computeExpensive(a, b);
const callback = () => doSomething(a);
// Just use MyComponent directly
```

Keep manual memoization only where an API requires a stable reference, for example:

- A value or callback in an effect dependency array where identity changes would re-run the effect (subscriptions, listeners)
- Callbacks or objects passed to libraries that compare by reference (for example, list `renderItem`/`keyExtractor`, store selectors, navigation or animation APIs)
- Code in files or components that the compiler skips

## Requirements

- Expo SDK 54 or later (this guide describes SDK 57 behavior)
- New Architecture: default since SDK 53; SDK 55+ has no Legacy Architecture, so no action is needed

## Verifying It's Working

React Compiler runs at build time. Use React DevTools to confirm components are optimized (compiled components show a memo badge).

## Troubleshooting

If you encounter issues:

1. Confirm `experiments.reactCompiler` is `true` and that no separate compiler plugin is in `babel.config.js`
2. Clear Metro cache: `npx expo start --clear`
3. Check for incompatible patterns in your code (rare)

React Compiler is designed to work with idiomatic React code. If it can't safely optimize a component, it skips that component without breaking your app.
