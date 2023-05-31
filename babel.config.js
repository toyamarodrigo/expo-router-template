module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["@babel/plugin-transform-flow-strip-types"],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-proposal-export-namespace-from"],
      ["react-native-reanimated/plugin"],
      [
        "module-resolver",
        {
          alias: {
            "@components": "./src/components",
            "@layouts": "./src/layouts",
            "@stores": "./src/stores",
            "@utils": "./src/utils",
            "@assets": "./assets",
            "@api": "./src/api",
            "@models": "./src/models",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      ],
      require.resolve("expo-router/babel"),
    ],
  };
};
