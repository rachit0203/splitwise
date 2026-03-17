import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

API.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // SecureStore may not be available on web
    console.warn("Could not read auth token:", e.message);
  }
  return config;
});

export default API;
