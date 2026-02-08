import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";
import { GOOGLE_CLIENT_ID } from "./constants";

WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth 훅 — expo-auth-session으로 idToken을 받아
 * Supabase signInWithIdToken으로 인증한다.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  async function signIn() {
    const result = await promptAsync();
    if (result.type === "success") {
      const idToken = result.params.id_token;
      if (idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) throw error;
      }
    }
  }

  return {
    signIn,
    loading: !request,
  };
}

/** 로그아웃 */
export async function signOut() {
  await supabase.auth.signOut();
}
