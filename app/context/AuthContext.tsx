import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/supabase/config";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

const AUTH_URI =
  "https://epqxqhjetxflplibxhwp.supabase.co/auth/v1/authorize?provider=google";
const AUTH_REDIRECT_URI = "memento://auth/redirect";

interface UserSession {
  session: Session | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<UserSession | undefined>(undefined);

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
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Open Google OAuth flow
  const signIn = async () => {
    setIsLoading(true);

    try {
      let result = await WebBrowser.openAuthSessionAsync(
        AUTH_URI,
        AUTH_REDIRECT_URI
      );

      if (result.type === "success" && result.url) {
        await handleOAuthCallback(result.url);
        router.replace("/(app)/(tabs)/mementos");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleOAuthCallback = async (url: string) => {
    try {
      // Parse the URL
      const parsedUrl = new URL(url);

      // Extract the fragment part (after #)
      const fragment = parsedUrl.hash.substr(1); // Remove the '#' from the beginning
      const params = new URLSearchParams(fragment); // Create a URLSearchParams object to parse the fragment

      // Extract the access_token and refresh_token
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token"); // Extract if available

      if (!access_token) {
        throw new Error("No access token found!");
      }

      // Use the token to get the authenticated user from Supabase
      const { data: user, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || "", // Fallback to an empty string if no refresh token is provided
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Error processing OAuth callback:", error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/");
  };

  //   NOTE: might not need if managed properly via signIn/signOut
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
