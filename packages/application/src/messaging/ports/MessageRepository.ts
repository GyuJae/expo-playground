import type { ConversationId, Message } from "@expo-playground/domain";

/** Message 영속성 추상화 */
export interface MessageRepository {
  /** 대화별 메시지 목록 조회 — 오래된 순 */
  findByConversationId(conversationId: ConversationId): Promise<Message[]>;
  /** 대화의 마지막 메시지 조회 — 미리보기용 */
  findLatestByConversationId(
    conversationId: ConversationId,
  ): Promise<Message | null>;
  /** 메시지 저장 */
  save(message: Message): Promise<void>;
}
