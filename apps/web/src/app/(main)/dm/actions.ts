"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveUseCase } from "@/lib/server/container";
import {
  ListConversations,
  GetOrCreateConversation,
  SendMessage,
  ListMessages,
  GetProfile,
} from "@expo-playground/application";
import {
  toConversationSummaryDTO,
  toConversationDTO,
  toMessageDTO,
  toUserDTO,
} from "@/lib/dto/serializers";
import type {
  ConversationSummaryDTO,
  ConversationDTO,
  MessageDTO,
  UserDTO,
} from "@/lib/dto/types";

/** 현재 인증 사용자 ID 조회 */
async function requireAuth(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다");
  return user.id;
}

/** 대화 목록 조회 */
export async function fetchConversations(): Promise<ConversationSummaryDTO[]> {
  const userId = await requireAuth();
  const useCase = await resolveUseCase(ListConversations);
  const summaries = await useCase.execute(userId);
  return summaries.map(toConversationSummaryDTO);
}

/** 대화 가져오기 또는 생성 */
export async function getOrCreateConversationAction(
  otherUserId: string,
): Promise<ConversationDTO> {
  const userId = await requireAuth();
  const useCase = await resolveUseCase(GetOrCreateConversation);
  const conversation = await useCase.execute({ userId1: userId, userId2: otherUserId });
  return toConversationDTO(conversation);
}

/** 메시지 목록 조회 */
export async function fetchMessages(conversationId: string): Promise<MessageDTO[]> {
  const userId = await requireAuth();
  const useCase = await resolveUseCase(ListMessages);
  const messages = await useCase.execute({ conversationId, requesterId: userId });
  return messages.map(toMessageDTO);
}

/** 메시지 전송 */
export async function sendMessageAction(
  conversationId: string,
  formData: FormData,
): Promise<MessageDTO> {
  const userId = await requireAuth();
  const body = formData.get("body") as string;

  const useCase = await resolveUseCase(SendMessage);
  const message = await useCase.execute({ conversationId, senderId: userId, body });
  return toMessageDTO(message);
}

/** 사용자 프로필 조회 */
export async function fetchUserForDM(userId: string): Promise<UserDTO | null> {
  try {
    const useCase = await resolveUseCase(GetProfile);
    const user = await useCase.execute(userId);
    return toUserDTO(user);
  } catch {
    return null;
  }
}

/** 현재 인증 사용자 ID 반환 */
export async function getCurrentUserId(): Promise<string> {
  return requireAuth();
}
