import "reflect-metadata";
import { container } from "tsyringe";
import { createClient } from "@/lib/supabase/server";
import { registerSupabaseAdapters } from "@expo-playground/infrastructure";

/**
 * 요청별 DI 초기화 — 매 Server Action 호출 시
 * 쿠키 기반 Supabase 클라이언트로 어댑터를 재등록하여
 * RLS가 현재 사용자 세션에 맞게 동작하도록 한다.
 */
async function initRequestContainer() {
  const supabase = await createClient();
  registerSupabaseAdapters(supabase);
}

/** Server Action에서 유스케이스를 resolve하여 반환하는 헬퍼 */
export async function resolveUseCase<T>(
  UseCaseClass: new (...args: any[]) => T,
): Promise<T> {
  await initRequestContainer();
  return container.resolve(UseCaseClass as any);
}
