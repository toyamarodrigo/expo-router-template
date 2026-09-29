/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/ios/",
    "<rootDir>/android/",
    "<rootDir>/dist/",
    "<rootDir>/.expo/",
  ],
};
