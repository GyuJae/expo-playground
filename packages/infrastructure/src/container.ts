import { container } from "tsyringe";
import { DI_TOKENS } from "@expo-playground/application";
import type { SupabaseClient } from "./supabase/client.js";
import { SupabaseAuthProvider } from "./supabase/SupabaseAuthProvider.js";
import { SupabaseUserRepository } from "./supabase/SupabaseUserRepository.js";
import { SupabasePostRepository } from "./supabase/SupabasePostRepository.js";
import { SupabaseCommentRepository } from "./supabase/SupabaseCommentRepository.js";
import { SupabaseConversationRepository } from "./supabase/SupabaseConversationRepository.js";
import { SupabaseMessageRepository } from "./supabase/SupabaseMessageRepository.js";
import { SupabaseMessageRealtime } from "./supabase/SupabaseMessageRealtime.js";
import { SupabaseCommentRealtime } from "./supabase/SupabaseCommentRealtime.js";

/**
 * Supabase 어댑터를 DI 컨테이너에 등록한다.
 * — 앱 진입점에서 Supabase 클라이언트를 주입하며 호출.
 */
export function registerSupabaseAdapters(client: SupabaseClient): void {
  container.registerInstance("SupabaseClient", client);
  container.register(DI_TOKENS.AuthProvider, { useClass: SupabaseAuthProvider });
  container.register(DI_TOKENS.UserRepository, { useClass: SupabaseUserRepository });
  container.register(DI_TOKENS.PostRepository, { useClass: SupabasePostRepository });
  container.register(DI_TOKENS.CommentRepository, { useClass: SupabaseCommentRepository });
  container.register(DI_TOKENS.ConversationRepository, { useClass: SupabaseConversationRepository });
  container.register(DI_TOKENS.MessageRepository, { useClass: SupabaseMessageRepository });
  container.register(DI_TOKENS.MessageRealtimePort, { useClass: SupabaseMessageRealtime });
  container.register(DI_TOKENS.CommentRealtimePort, { useClass: SupabaseCommentRealtime });
}
