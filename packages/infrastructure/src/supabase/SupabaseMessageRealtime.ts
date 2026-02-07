import { injectable, inject } from "tsyringe";
import {
  Message,
  MessageBody,
  createMessageId,
  createConversationId,
  createUserId,
  type Message as MessageType,
} from "@expo-playground/domain";
import type {
  MessageRealtimePort,
  RealtimeSubscription,
} from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** messages 테이블 행 타입 (Realtime payload) */
interface MessagePayload {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/** payload → Message 도메인 엔티티 */
function payloadToDomain(payload: MessagePayload): MessageType {
  return Message.reconstruct({
    id: createMessageId(payload.id),
    conversationId: createConversationId(payload.conversation_id),
    senderId: createUserId(payload.sender_id),
    body: MessageBody.reconstruct(payload.body),
    createdAt: new Date(payload.created_at),
  });
}

/**
 * Supabase Realtime 기반 MessageRealtimePort 구현
 */
@injectable()
export class SupabaseMessageRealtime implements MessageRealtimePort {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  onNewMessage(
    conversationId: string,
    callback: (message: MessageType) => void,
  ): RealtimeSubscription {
    const channel = this.client
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payloadToDomain(payload.new as MessagePayload));
        },
      )
      .subscribe();

    return {
      unsubscribe: async () => {
        await this.client.removeChannel(channel);
      },
    };
  }
}
