/**
 * @description App context/hook for managing user authentication via Supabase Auth + Google OAuth
 * @requirements FR-1, FR-2
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/libs/supabase";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import * as AuthSession from "expo-auth-session";

const AUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "memento",
  path: "auth/redirect",
});
const AUTH_URI = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(AUTH_REDIRECT_URI)}`;

export interface UserSession {
  session: Session | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<UserSession | undefined>(undefined);

/**
 * Hook that allows other components to access the current {@link UserSession}.
 * Includes user details and sign in/out methods for managing Supabase auth flow.
 */
export const useSession = (): UserSession => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return context;
};

const handleOAuthCallback = async (url: string) => {
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
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error("Error processing OAuth callback:", error.message);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        await handleOAuthCallback(result.url);
        router.replace("/(app)/(tabs)/mementos");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  /**
   * Signs out the user and redirects to the sign in page.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/");
  };

  useEffect(() => {
    // TODO: fixme (use node_env or env var)
    if (true) {
      signInTestUser();
    }

    // Check async storage for a valid session from previous app use
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    checkSession();

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
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const signInTestUser = async () =>
  supabase.auth.signInWithPassword({
    email: "e2e-test@example.com",
    password: "memento123",
  });
