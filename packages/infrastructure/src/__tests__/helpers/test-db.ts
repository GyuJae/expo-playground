import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 테스트 DB 초기화 — auth.users 전체 삭제 (CASCADE로 profiles/posts 삭제됨)
 */
export async function cleanDatabase(admin: SupabaseClient): Promise<void> {
  const { data } = await admin.auth.admin.listUsers();
  if (data?.users) {
    for (const user of data.users) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}
