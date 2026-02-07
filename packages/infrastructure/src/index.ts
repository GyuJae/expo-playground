/** 인프라스트럭처 레이어 — 어댑터 / 외부 서비스 구현 */
import "reflect-metadata";

// ── Supabase 클라이언트 ──
export { createSupabaseClient, type SupabaseClient } from "./supabase/client.js";

// ── Supabase 어댑터 ──
export { SupabaseAuthProvider } from "./supabase/SupabaseAuthProvider.js";
export { SupabaseUserRepository } from "./supabase/SupabaseUserRepository.js";
export { SupabasePostRepository } from "./supabase/SupabasePostRepository.js";
export { SupabaseCommentRepository } from "./supabase/SupabaseCommentRepository.js";
export { SupabaseConversationRepository } from "./supabase/SupabaseConversationRepository.js";
export { SupabaseMessageRepository } from "./supabase/SupabaseMessageRepository.js";

// ── DI 컨테이너 등록 ──
export { registerSupabaseAdapters } from "./container.js";
