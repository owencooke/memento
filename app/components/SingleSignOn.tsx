import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { Button } from "react-native";
import { supabase } from "@/libs/supabase/config";
import { useEffect } from "react";

const redirectUri = "https://epqxqhjetxflplibxhwp.supabase.co/auth/v1/callback";

// const redirectUri = AuthSession.makeRedirectUri({
//   scheme: "memento", // Ensure this matches your Expo configuration
//   preferLocalhost: true,
// });

WebBrowser.maybeCompleteAuthSession(); // Ensures the session closes properly

export default function GoogleSignIn() {
  // Using the Google auth provider from expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "226474711830-eo787l9uv0m2e12f6qdcavkleeuu9341.apps.googleusercontent.com", // Your Google client ID
    redirectUri,
    scopes: ["profile", "email"],
    // state: "please",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { idToken } = response?.authentication || {};
      if (idToken) handleSignInWithGoogle(idToken);
    }
  }, [response]);

  async function handleSignInWithGoogle(idToken: string | undefined) {
    if (!idToken) return;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) console.error("Sign-In Error:", error);
    else {
      console.log("Signed in!", data);
    }
  }

  return <Button title="Sign in with Google" onPress={() => promptAsync()} />;
}
