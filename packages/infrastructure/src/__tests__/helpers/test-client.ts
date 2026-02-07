import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Supabase 로컬 well-known 값 */
const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

/**
 * service_role 키를 사용하는 관리자 클라이언트 생성
 * — RLS 우회, 테스트 전용
 */
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export { SUPABASE_URL, SERVICE_ROLE_KEY };
