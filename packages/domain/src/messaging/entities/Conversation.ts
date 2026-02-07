import { Entity } from "../../shared/Entity.js";
import type { ConversationId, UserId } from "../../shared/types.js";
import type { ConversationMember } from "../value-objects/ConversationMember.js";

interface CreateConversationParams {
  id: ConversationId;
  members: ConversationMember[];
  createdAt: Date;
}

/**
 * Conversation 엔티티 — 1:1 DM 대화
 */
export class Conversation extends Entity<ConversationId> {
  private readonly _members: ConversationMember[];
  private readonly _createdAt: Date;

  private constructor(params: CreateConversationParams) {
    super(params.id);
    this._members = [...params.members];
    this._createdAt = params.createdAt;
  }

  /** 새 Conversation 생성 */
  static create(params: CreateConversationParams): Conversation {
    return new Conversation(params);
  }

  /** DB 복원용 */
  static reconstruct(params: CreateConversationParams): Conversation {
    return new Conversation(params);
  }

  get members(): readonly ConversationMember[] {
    return this._members;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /** 사용자가 대화 멤버인지 확인 */
  isMember(userId: UserId): boolean {
    return this._members.some((m) => m.userId === userId);
  }
}
