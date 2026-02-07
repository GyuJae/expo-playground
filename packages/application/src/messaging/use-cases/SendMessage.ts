import { injectable, inject } from "tsyringe";
import {
  Message,
  MessageBody,
  createConversationId,
  createUserId,
  createMessageId,
  type MessageId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { MessageRepository } from "../ports/MessageRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

interface SendMessageInput {
  conversationId: string;
  senderId: string;
  body: string;
}

/**
 * 메시지 전송 유스케이스 — 대화 멤버만 전송 가능
 */
@injectable()
export class SendMessage {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.MessageRepository)
    private msgRepo: MessageRepository,
  ) {}

  async execute(input: SendMessageInput): Promise<Message> {
    const conversationId = createConversationId(input.conversationId);
    const senderId = createUserId(input.senderId);
    const body = MessageBody.create(input.body);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(senderId)) {
      throw new UnauthorizedError("대화 멤버만 메시지를 보낼 수 있습니다");
    }

    const messageId = createMessageId(crypto.randomUUID()) as MessageId;
    const now = new Date();

    const message = Message.create({
      id: messageId,
      conversationId,
      senderId,
      body,
      createdAt: now,
    });

    await this.msgRepo.save(message);
    return message;
  }
}
