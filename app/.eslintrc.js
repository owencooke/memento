// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "import/no-unresolved": "off",
  },
  ignorePatterns: [
    "/dist/*",
    "src/components/ui/*",
    "src/api-client/generated/**",
    "*.d.ts",
  ],
};
