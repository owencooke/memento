import * as React from "react";
import { Button } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/libs/supabase/config";
import { useRouter } from "expo-router";

// Define your redirect URI
// const redirectUri = Linking.createURL("/auth/redirect"); // Matches Supabase config

export default function GoogleSignIn() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  //   const redirectUri = AuthSession.makeRedirectUri({
  //     scheme: "memento",
  //     path: "auth/redirect",
  //     preferLocalhost: false, // Avoids localhost URLs
  //     isTripleSlashed: false, // Ensures correct format
  //   });
  const redirectUri = "memento://auth/redirect";

  // Handle incoming OAuth response
  React.useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url) {
        await handleOAuthCallback(url);
      }
    };

    // Listen for deep link events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Open Google OAuth flow
  const signInWithGoogle = async () => {
    setIsAuthenticating(true);

    // let redirect = AuthSession.makeRedirectUri({
    //   scheme: "memento",
    //   path: redirectUri,
    // });

    console.log({ redirectUri });

    try {
      let result = await WebBrowser.openAuthSessionAsync(
        "https://epqxqhjetxflplibxhwp.supabase.co/auth/v1/authorize?provider=google",
        redirectUri
      );

      if (result.type === "success" && result.url) {
        await handleOAuthCallback(result.url);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Extract token and sign in user
  const handleOAuthCallback = async (url: string) => {
    console.log({ url });
    // try {
    //   const { data, error } = await supabase.auth.getSessionFromUrl({ url });

    //   if (error) {
    //     console.error("Error processing OAuth callback:", error.message);
    //   } else {
    //     console.log("✅ Signed in!", data);
    //     router.push("/home"); // Navigate to home or dashboard
    //   }
    // } catch (err) {
    //   console.error("OAuth callback handling error:", err);
    // }
  };

  return (
    <Button
      title="Sign in with Google"
      onPress={signInWithGoogle}
      disabled={isAuthenticating}
    />
  );
}
