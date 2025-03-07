import type { CreateClientConfig } from "./generated/client.gen";

const getBaseUrl = () => {
  const tunnelHost = process.env.EXPO_PUBLIC_TUNNEL_API_HOST;
  // Check if backend API is being tunneled
  if (tunnelHost) {
    return `https://${tunnelHost}`;
  }
  // Use machine's host IP as host for backend
  const hostname = process.env.EXPO_PUBLIC_API_HOST ?? "127.0.0.1";
  return `http://${hostname}:8000/`;
};

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: getBaseUrl(),
});
