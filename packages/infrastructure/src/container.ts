import { container } from "tsyringe";
import { DI_TOKENS } from "@expo-playground/application";
import type { SupabaseClient } from "./supabase/client.js";
import { SupabaseAuthProvider } from "./supabase/SupabaseAuthProvider.js";
import { SupabaseUserRepository } from "./supabase/SupabaseUserRepository.js";
import { SupabasePostRepository } from "./supabase/SupabasePostRepository.js";

/**
 * Supabase 어댑터를 DI 컨테이너에 등록한다.
 * — 앱 진입점에서 Supabase 클라이언트를 주입하며 호출.
 */
export function registerSupabaseAdapters(client: SupabaseClient): void {
  container.registerInstance("SupabaseClient", client);
  container.register(DI_TOKENS.AuthProvider, { useClass: SupabaseAuthProvider });
  container.register(DI_TOKENS.UserRepository, { useClass: SupabaseUserRepository });
  container.register(DI_TOKENS.PostRepository, { useClass: SupabasePostRepository });
}
