import { injectable, inject } from "tsyringe";
import {
  createConversationId,
  createUserId,
  type Message,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { MessageRepository } from "../ports/MessageRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

interface ListMessagesInput {
  conversationId: string;
  requesterId: string;
}

/**
 * 대화의 메시지 목록 조회 유스케이스 — 대화 멤버만 조회 가능
 */
@injectable()
export class ListMessages {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.MessageRepository)
    private msgRepo: MessageRepository,
  ) {}

  async execute(input: ListMessagesInput): Promise<Message[]> {
    const conversationId = createConversationId(input.conversationId);
    const requesterId = createUserId(input.requesterId);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(requesterId)) {
      throw new UnauthorizedError("대화 멤버만 메시지를 조회할 수 있습니다");
    }

    return this.msgRepo.findByConversationId(conversationId);
  }
}
