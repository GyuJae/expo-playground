import "reflect-metadata";
import { registerSupabaseAdapters } from "@expo-playground/infrastructure";
import { supabase } from "./supabase";

let initialized = false;

/**
 * DI 컨테이너 초기화 — 앱 시작 시 1회 호출.
 * Supabase 클라이언트를 주입하여 모든 어댑터를 등록한다.
 */
export function initContainer(): void {
  if (initialized) return;
  registerSupabaseAdapters(supabase);
  initialized = true;
}
