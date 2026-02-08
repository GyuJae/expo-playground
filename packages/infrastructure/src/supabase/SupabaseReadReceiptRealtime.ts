import { injectable, inject } from "tsyringe";
import {
  ReadPosition,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type {
  ReadReceiptRealtimePort,
  RealtimeSubscription,
} from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** read_receipts 테이블 Realtime payload */
interface ReadReceiptPayload {
  conversation_id: string;
  user_id: string;
  last_read_at: string;
}

/** payload → ReadPosition 도메인 VO */
function payloadToDomain(payload: ReadReceiptPayload): ReadPosition {
  return ReadPosition.reconstruct(
    createConversationId(payload.conversation_id),
    createUserId(payload.user_id),
    new Date(payload.last_read_at),
  );
}

/**
 * Supabase Realtime 기반 ReadReceiptRealtimePort 구현
 */
@injectable()
export class SupabaseReadReceiptRealtime implements ReadReceiptRealtimePort {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  onReadPositionChanged(
    conversationId: string,
    callback: (readPosition: ReadPosition) => void,
  ): RealtimeSubscription {
    const channel = this.client
      .channel(`read_receipts:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "read_receipts",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payloadToDomain(payload.new as ReadReceiptPayload));
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
