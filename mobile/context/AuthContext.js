import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import API from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("authToken");
        const storedUser = await SecureStore.getItemAsync("authUser");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        // SecureStore not available (e.g. web) – skip session restore
        console.warn("Could not restore session:", e.message);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/api/auth/login", { email, password });
    try {
      await SecureStore.setItemAsync("authToken", data.token);
      await SecureStore.setItemAsync("authUser", JSON.stringify(data.user));
    } catch (e) {
      console.warn("Could not persist session:", e.message);
    }
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/api/auth/register", {
      name,
      email,
      password,
    });
    try {
      await SecureStore.setItemAsync("authToken", data.token);
      await SecureStore.setItemAsync("authUser", JSON.stringify(data.user));
    } catch (e) {
      console.warn("Could not persist session:", e.message);
    }
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("authUser");
    } catch (e) {
      console.warn("Could not clear session:", e.message);
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
