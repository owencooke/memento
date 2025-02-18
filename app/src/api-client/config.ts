import type { CreateClientConfig } from "./generated/client.gen";

const getBaseUrl = () => {
  const hostname = process.env.EXPO_PUBLIC_API_HOST ?? "127.0.0.1";
  return `http://${hostname}:8000/`;
};

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: getBaseUrl(),
});
