import type { UserId } from "@expo-playground/domain";

/** Google 인증 결과 */
export interface AuthResult {
  userId: UserId;
  email: string;
}

/** 외부 인증 서비스 추상화 */
export interface AuthProvider {
  /** Google ID 토큰으로 인증하여 userId + email 반환 */
  signInWithGoogle(idToken: string): Promise<AuthResult>;
}
