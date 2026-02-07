import { ValueObject } from "../../shared/ValueObject.js";
import type { UserId } from "../../shared/types.js";

interface ConversationMemberProps {
  userId: UserId;
  joinedAt: Date;
}

/**
 * 대화 참여자 값 객체 — Conversation 애그리게이트에 종속
 */
export class ConversationMember extends ValueObject<ConversationMemberProps> {
  private constructor(props: ConversationMemberProps) {
    super(props);
  }

  static create(userId: UserId, joinedAt: Date): ConversationMember {
    return new ConversationMember({ userId, joinedAt });
  }

  /** DB 복원용 */
  static reconstruct(userId: UserId, joinedAt: Date): ConversationMember {
    return new ConversationMember({ userId, joinedAt });
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }
}
