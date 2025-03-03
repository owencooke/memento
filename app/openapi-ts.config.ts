import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./scripts/openapi.json",
  output: "./src/api-client/generated",
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/api-client/config.ts",
    },
    "@tanstack/react-query",
  ],
});
