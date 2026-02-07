import { injectable, inject } from "tsyringe";
import { createUserId } from "@expo-playground/domain";
import type { AuthProvider, AuthResult } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/**
 * Supabase 기반 AuthProvider 구현
 * — Google ID 토큰으로 signInWithIdToken 호출
 */
@injectable()
export class SupabaseAuthProvider implements AuthProvider {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async signInWithGoogle(idToken: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error || !data.user) {
      throw new Error(`Google 인증 실패: ${error?.message ?? "사용자 정보 없음"}`);
    }

    const userId = createUserId(data.user.id);
    const email = data.user.email ?? "";

    return { userId, email };
  }
}
