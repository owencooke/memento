import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/src/libs/supabase";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserSession {
  session: Session | null;
  isLoading: boolean;
  isNewUser: boolean | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<UserSession | undefined>(undefined);

export const useSession = (): UserSession => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  const handleLoadSession = async (session: Session | null) => {
    setSession(session);
    setIsLoading(false);

    // Fetch the isNewUser flag from AsyncStorage
    const storedIsNewUser = await AsyncStorage.getItem("isNewUser");
    setIsNewUser(storedIsNewUser ? JSON.parse(storedIsNewUser) : null);
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      handleLoadSession(session);
    };

    checkSession();

    // Subscribe to Supabase Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => handleLoadSession(session),
    );
    return () => authListener.subscription?.unsubscribe();
  }, []);

  /**
   * Opens the OAuth URL in an external web browser. Once the user completes
   * the OAuth flow, the resulting URL is parsed and used to create the
   * Supabase Auth session.
   */
  const signIn = async () => {
    setIsLoading(true);
    try {
      let result = await WebBrowser.openAuthSessionAsync(
        AUTH_URI,
        AUTH_REDIRECT_URI,
      );

      if (result.type === "success" && result.url) {
        // Process OAuth result
        const user = await handleOAuthCallback(result.url);
        // Check if this is a new user / first time signing in
        if (user) {
          const isNew = await checkIfNewUser(user);
          setIsNewUser(isNew);
          await AsyncStorage.setItem("isNewUser", JSON.stringify(isNew));
        }
      }
    } catch (error) {
      console.log("Google Sign-In Error:", error);
    }
  };

  /**
   * Signs out the user.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsNewUser(null);
    await AsyncStorage.removeItem("isNewUser");
  };

  useEffect(() => {
    // Check async storage for a valid session from previous app use
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    checkSession();

    // For E2E tests, sign in a test user to skip sign-up page
    if (process.env.EXPO_PUBLIC_E2E_TESTING === "true") {
      signInTestUser();
    }

    // Subscribe to Supabase Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setIsLoading(false);
      },
    );
    return () => authListener.subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, isLoading, signIn, signOut, isNewUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Global variables

const AUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "memento",
  path: "auth/redirect",
});
const AUTH_URI = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(AUTH_REDIRECT_URI)}`;

// Helpers

const handleOAuthCallback = async (url: string): Promise<User | null> => {
  try {
    // Parse the OAuth return URL
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.hash.substr(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token") ?? "";

    if (!access_token) {
      throw new Error("Failed to parse access_token from OAuth URL");
    }

    // Use the token to set the Supabase session
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  } catch (error: any) {
    console.log("Error processing OAuth callback:", error.message);
    return null;
  }
};

const checkIfNewUser = async (user: User) => {
  // Note: ensure RLS policy enabled for user_info table to allow user to access their own data
  const { data: userInfo } = await supabase
    .from("user_info")
    .select("id")
    .eq("id", user.id);
  return !userInfo || userInfo.length === 0;
};

const signInTestUser = async () =>
  supabase.auth.signInWithPassword({
    email: "e2e-test@example.com",
    password: "memento123",
  });
