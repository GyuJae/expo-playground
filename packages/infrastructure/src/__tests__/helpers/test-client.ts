import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Supabase 로컬 URL */
const SUPABASE_URL = "http://127.0.0.1:54321";

/**
 * globalSetup에서 생성한 ES256 service_role JWT를 동기적으로 읽는다.
 * — Supabase CLI 2.76+ 에서 GoTrue가 ES256을 사용하므로 동적 생성 필요.
 */
const KEY_FILE = join(import.meta.dirname, ".service-role-key");
const SERVICE_ROLE_KEY = readFileSync(KEY_FILE, "utf8").trim();

/**
 * service_role 키를 사용하는 관리자 클라이언트 반환
 */
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export { SUPABASE_URL, SERVICE_ROLE_KEY };
