module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@components": "./src/components",
            "@layouts": "./src/layouts",
            "@stores": "./src/stores",
            "@utils": "./src/utils",
            "@assets": "./assets",
            "@api": "./src/api",
            "@models": "./src/models",
            "@hooks": "./src/hooks",
          },
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".android.js",
            ".android.tsx",
            ".ios.js",
            ".ios.tsx",
            ".json",
          ],
        },
      ],
      ["nativewind/babel"],
      ["react-native-reanimated/plugin"],
    ],
  };
};
