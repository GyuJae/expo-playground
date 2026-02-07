import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

/**
 * Vitest globalSetup — Supabase 로컬 인스턴스 실행 확인
 */
export async function setup(): Promise<void> {
  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await client.from("profiles").select("user_id").limit(1);
  if (error) {
    throw new Error(
      `Supabase 로컬 인스턴스에 연결할 수 없습니다. 'npx supabase start'를 먼저 실행하세요.\n${error.message}`,
    );
  }
}
