// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const pluginQuery = require("@tanstack/eslint-plugin-query");

module.exports = defineConfig([
  expoConfig,
  ...pluginQuery.configs["flat/recommended"],
  prettierRecommended,
  {
    ignores: ["dist/*", ".expo/*", "coverage/*", "ios/*", "android/*", ".agents/*"],
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "import/order": [
        "warn",
        {
          pathGroups: [{ pattern: "~/**", group: "external", position: "after" }],
          "newlines-between": "always",
        },
      ],
      "react/self-closing-comp": "warn",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
      ],
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/stable-query-client": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "after-used", ignoreRestSiblings: false, argsIgnorePattern: "^_.*?$" },
      ],
    },
  },
]);
