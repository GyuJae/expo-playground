import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 테스트 DB 초기화 — public 테이블 직접 삭제 후 auth.users 삭제
 */
export async function cleanDatabase(admin: SupabaseClient): Promise<void> {
  // public 테이블 먼저 삭제 (FK 순서)
  await admin.from("read_receipts").delete().neq("conversation_id", "00000000-0000-0000-0000-000000000000");
  await admin.from("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("comments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("conversation_members").delete().neq("conversation_id", "00000000-0000-0000-0000-000000000000");
  await admin.from("conversations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("profiles").delete().neq("user_id", "00000000-0000-0000-0000-000000000000");

  // auth.users 삭제
  const { data } = await admin.auth.admin.listUsers();
  if (data?.users) {
    for (const user of data.users) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}
