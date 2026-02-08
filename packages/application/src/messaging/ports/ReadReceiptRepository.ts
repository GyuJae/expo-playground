import type { ConversationId, ReadPosition, UserId } from "@expo-playground/domain";

/** 읽음 위치 영속성 추상화 */
export interface ReadReceiptRepository {
  /** 대화·사용자별 읽음 위치 조회 — 없으면 null */
  findByConversationAndUser(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<ReadPosition | null>;

  /** 대화의 모든 멤버 읽음 위치 조회 */
  findAllByConversationId(
    conversationId: ConversationId,
  ): Promise<ReadPosition[]>;

  /** 읽음 위치 생성 또는 갱신 (UPSERT) */
  upsert(readPosition: ReadPosition): Promise<void>;

  /** 대화에서 사용자의 안 읽은 메시지 수 계산 */
  countUnread(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<number>;
}
