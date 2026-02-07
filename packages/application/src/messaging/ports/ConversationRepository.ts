import type {
  ConversationId,
  UserId,
  Conversation,
} from "@expo-playground/domain";

/** Conversation 영속성 추상화 */
export interface ConversationRepository {
  /** ID로 대화 조회 — 없으면 null */
  findById(id: ConversationId): Promise<Conversation | null>;
  /** 멤버 쌍으로 1:1 DM 검색 — 없으면 null */
  findByMembers(
    userId1: UserId,
    userId2: UserId,
  ): Promise<Conversation | null>;
  /** 사용자의 모든 대화 조회 */
  findAllByUserId(userId: UserId): Promise<Conversation[]>;
  /** 대화 + 멤버 저장 */
  save(conversation: Conversation): Promise<void>;
}
