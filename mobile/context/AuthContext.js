import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo";
import API from "../services/api";

const AuthContext = createContext(null);

/**
 * Bridges Clerk ↔ backend DB.
 * After Clerk sign-in, fetches the MongoDB user via /api/users/me.
 * The requireAuth middleware auto-creates the user if it doesn't exist.
 */
export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const lastSyncAttemptRef = useRef(null);

  useEffect(() => {
    const clerkUserId = clerkUser?.id || null;

    if (!isLoaded) return;

    if (!isSignedIn) {
      setDbUser(null);
      lastSyncAttemptRef.current = null;
      return;
    }

    if (!clerkUserId || lastSyncAttemptRef.current === clerkUserId) return;

    const syncUser = async () => {
      try {
        setSyncing(true);
        const token = await getToken();
        if (!token) {
          console.warn("No Clerk token available for sync.");
          return;
        }

        lastSyncAttemptRef.current = clerkUserId;
        const { data } = await API.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDbUser(data.user);
      } catch (e) {
        console.warn("Sync user error:", e.message);
        setDbUser({
          _id: null,
          name:
            [clerkUser.firstName, clerkUser.lastName]
              .filter(Boolean)
              .join(" ") || "User",
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
        });
      } finally {
        setSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  const value = useMemo(
    () => ({
      user: dbUser,
      loading: !isLoaded || (isSignedIn && syncing && !dbUser),
      isAuthenticated: isSignedIn,
    }),
    [dbUser, isLoaded, isSignedIn, syncing],
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
