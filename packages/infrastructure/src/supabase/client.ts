import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 팩토리
 * — URL과 키를 받아 SupabaseClient 인스턴스를 생성한다.
 */
export function createSupabaseClient(
  url: string,
  key: string,
): SupabaseClient {
  return createClient(url, key);
}

export type { SupabaseClient };
