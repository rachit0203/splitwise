import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://splitwise-backend-snkw.onrender.com";

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set – using fallback:", BASE_URL);
}

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * The token provider is set from AppNavigator/AuthContext
 * so we can call Clerk's getToken() without hook dependency.
 */
let tokenProvider = null;

export function setTokenProvider(fn) {
  tokenProvider = fn;
}

API.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to get Clerk token:", e.message);
    }
  }
  return config;
});

export default API;
