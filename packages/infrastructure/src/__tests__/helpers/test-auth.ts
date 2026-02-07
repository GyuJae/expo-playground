import type { SupabaseClient } from "@supabase/supabase-js";

interface TestUser {
  id: string;
  email: string;
}

/**
 * 테스트용 인증 사용자 생성 (Admin API)
 * — handle_new_user 트리거로 profiles 자동 생성됨
 */
export async function createTestAuthUser(
  admin: SupabaseClient,
  overrides?: { email?: string; nickname?: string },
): Promise<TestUser> {
  const email = overrides?.email ?? `test-${crypto.randomUUID()}@example.com`;
  const nickname = overrides?.nickname ?? "TestUser";

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: nickname },
  });

  if (error || !data.user) {
    throw new Error(`테스트 사용자 생성 실패: ${error?.message}`);
  }

  return { id: data.user.id, email };
}
