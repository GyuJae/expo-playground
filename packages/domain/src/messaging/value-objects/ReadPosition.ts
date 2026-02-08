import { ValueObject } from "../../shared/ValueObject.js";
import type { ConversationId, UserId } from "../../shared/types.js";

interface ReadPositionProps {
  conversationId: ConversationId;
  userId: UserId;
  lastReadAt: Date;
}

/**
 * 읽음 위치 값 객체 — 대화별 사용자의 마지막 읽은 시각
 */
export class ReadPosition extends ValueObject<ReadPositionProps> {
  private constructor(props: ReadPositionProps) {
    super(props);
  }

  static create(
    conversationId: ConversationId,
    userId: UserId,
    lastReadAt: Date,
  ): ReadPosition {
    return new ReadPosition({ conversationId, userId, lastReadAt });
  }

  /** DB 복원용 */
  static reconstruct(
    conversationId: ConversationId,
    userId: UserId,
    lastReadAt: Date,
  ): ReadPosition {
    return new ReadPosition({ conversationId, userId, lastReadAt });
  }

  get conversationId(): ConversationId {
    return this.props.conversationId;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get lastReadAt(): Date {
    return this.props.lastReadAt;
  }

  /** 주어진 메시지 생성 시각이 읽음 범위에 포함되는지 판별 */
  hasRead(messageCreatedAt: Date): boolean {
    return messageCreatedAt.getTime() <= this.props.lastReadAt.getTime();
  }
}
