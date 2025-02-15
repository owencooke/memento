import * as React from "react";
import { Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/libs/supabase/config";

const redirectUri = "memento://auth/redirect";

export default function GoogleSignIn() {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  // Open Google OAuth flow
  const signInWithGoogle = async () => {
    setIsAuthenticating(true);

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
        console.error("No access token found!");
        return;
      }

      // Use the token to get the authenticated user from Supabase
      const { data: user, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || "", // Fallback to an empty string if no refresh token is provided
      });

      if (error) {
        console.error("Error setting session:", error.message);
        return;
      }

      console.log("✅ Supabase user:", user);
    } catch (error: any) {
      console.error("Error processing OAuth callback:", error.message);
    }
  };

  return (
    <Button
      title="Sign in with Google"
      onPress={signInWithGoogle}
      disabled={isAuthenticating}
    />
  );
}
