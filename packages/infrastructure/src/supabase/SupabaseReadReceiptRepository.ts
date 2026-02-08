import { injectable, inject } from "tsyringe";
import {
  ReadPosition,
  createConversationId,
  createUserId,
  type ConversationId,
  type UserId,
} from "@expo-playground/domain";
import type { ReadReceiptRepository } from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** read_receipts 테이블 행 타입 */
interface ReadReceiptRow {
  conversation_id: string;
  user_id: string;
  last_read_at: string;
}

/** DB 행 → ReadPosition 도메인 VO */
function rowToDomain(row: ReadReceiptRow): ReadPosition {
  return ReadPosition.reconstruct(
    createConversationId(row.conversation_id),
    createUserId(row.user_id),
    new Date(row.last_read_at),
  );
}

/**
 * Supabase 기반 ReadReceiptRepository 구현
 */
@injectable()
export class SupabaseReadReceiptRepository implements ReadReceiptRepository {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  async findByConversationAndUser(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<ReadPosition | null> {
    const { data, error } = await this.client
      .from("read_receipts")
      .select("*")
      .eq("conversation_id", conversationId as string)
      .eq("user_id", userId as string)
      .maybeSingle();

    if (error) {
      throw new Error(`읽음 위치 조회 실패: ${error.message}`);
    }

    return data ? rowToDomain(data as ReadReceiptRow) : null;
  }

  async findAllByConversationId(
    conversationId: ConversationId,
  ): Promise<ReadPosition[]> {
    const { data, error } = await this.client
      .from("read_receipts")
      .select("*")
      .eq("conversation_id", conversationId as string);

    if (error) {
      throw new Error(`읽음 위치 목록 조회 실패: ${error.message}`);
    }

    return (data as ReadReceiptRow[]).map(rowToDomain);
  }

  async upsert(readPosition: ReadPosition): Promise<void> {
    const { error } = await this.client
      .from("read_receipts")
      .upsert(
        {
          conversation_id: readPosition.conversationId as string,
          user_id: readPosition.userId as string,
          last_read_at: readPosition.lastReadAt.toISOString(),
        },
        { onConflict: "conversation_id,user_id" },
      );

    if (error) {
      throw new Error(`읽음 위치 저장 실패: ${error.message}`);
    }
  }

  async countUnread(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<number> {
    // 1단계: 사용자의 last_read_at 조회
    const rp = await this.findByConversationAndUser(conversationId, userId);

    // 2단계: last_read_at 이후 메시지 수 카운트
    let query = this.client
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId as string);

    if (rp) {
      query = query.gt("created_at", rp.lastReadAt.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`안 읽은 메시지 수 조회 실패: ${error.message}`);
    }

    return count ?? 0;
  }
}
