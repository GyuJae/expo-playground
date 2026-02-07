import { Entity } from "../../shared/Entity.js";
import type {
  MessageId,
  ConversationId,
  UserId,
} from "../../shared/types.js";
import type { MessageBody } from "../value-objects/MessageBody.js";

interface CreateMessageParams {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  body: MessageBody;
  createdAt: Date;
}

/**
 * Message 엔티티 — 불변 (mutation 메서드 없음)
 */
export class Message extends Entity<MessageId> {
  private readonly _conversationId: ConversationId;
  private readonly _senderId: UserId;
  private readonly _body: MessageBody;
  private readonly _createdAt: Date;

  private constructor(params: CreateMessageParams) {
    super(params.id);
    this._conversationId = params.conversationId;
    this._senderId = params.senderId;
    this._body = params.body;
    this._createdAt = params.createdAt;
  }

  /** 새 Message 생성 */
  static create(params: CreateMessageParams): Message {
    return new Message(params);
  }

  /** DB 복원용 */
  static reconstruct(params: CreateMessageParams): Message {
    return new Message(params);
  }

  get conversationId(): ConversationId {
    return this._conversationId;
  }

  get senderId(): UserId {
    return this._senderId;
  }

  get body(): MessageBody {
    return this._body;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
