import { injectable, inject } from "tsyringe";
import { createConversationId, createUserId, type Message } from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { MessageRealtimePort, RealtimeSubscription } from "../ports/MessageRealtimePort.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { ConversationNotFoundError, UnauthorizedError } from "../../shared/errors.js";

interface SubscribeToMessagesInput {
  conversationId: string;
  requesterId: string;
  onMessage: (message: Message) => void;
}

/**
 * 대화 메시지 실시간 구독 유스케이스 — 대화 멤버만 구독 가능
 */
@injectable()
export class SubscribeToMessages {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.MessageRealtimePort)
    private realtime: MessageRealtimePort,
  ) {}

  async execute(input: SubscribeToMessagesInput): Promise<RealtimeSubscription> {
    const conversationId = createConversationId(input.conversationId);
    const requesterId = createUserId(input.requesterId);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(requesterId)) {
      throw new UnauthorizedError("대화 멤버만 구독할 수 있습니다");
    }

    return this.realtime.onNewMessage(input.conversationId, input.onMessage);
  }
}
