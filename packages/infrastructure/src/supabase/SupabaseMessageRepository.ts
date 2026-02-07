import { injectable, inject } from "tsyringe";
import {
  Message,
  MessageBody,
  createMessageId,
  createConversationId,
  createUserId,
  type ConversationId,
} from "@expo-playground/domain";
import type { MessageRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** messages 테이블 행 타입 */
interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/** DB 행 → Message 도메인 엔티티 */
function rowToDomain(row: MessageRow): Message {
  return Message.reconstruct({
    id: createMessageId(row.id),
    conversationId: createConversationId(row.conversation_id),
    senderId: createUserId(row.sender_id),
    body: MessageBody.reconstruct(row.body),
    createdAt: new Date(row.created_at),
  });
}

/**
 * Supabase 기반 MessageRepository 구현
 */
@injectable()
export class SupabaseMessageRepository implements MessageRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findByConversationId(
    conversationId: ConversationId,
  ): Promise<Message[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId as string)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`메시지 목록 조회 실패: ${error.message}`);
    }

    return (data as MessageRow[]).map(rowToDomain);
  }

  async findLatestByConversationId(
    conversationId: ConversationId,
  ): Promise<Message | null> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`최신 메시지 조회 실패: ${error.message}`);
    }

    return data ? rowToDomain(data as MessageRow) : null;
  }

  async save(message: Message): Promise<void> {
    const { error } = await this.client.from("messages").insert({
      id: message.id as string,
      conversation_id: message.conversationId as string,
      sender_id: message.senderId as string,
      body: message.body.value,
    });

    if (error) {
      throw new Error(`메시지 저장 실패: ${error.message}`);
    }
  }
}
