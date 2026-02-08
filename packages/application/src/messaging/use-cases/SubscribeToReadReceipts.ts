import { injectable, inject } from "tsyringe";
import {
  createConversationId,
  createUserId,
  type ReadPosition,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { ReadReceiptRealtimePort } from "../ports/ReadReceiptRealtimePort.js";
import type { RealtimeSubscription } from "../ports/MessageRealtimePort.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

interface SubscribeToReadReceiptsInput {
  conversationId: string;
  requesterId: string;
  onReadPosition: (readPosition: ReadPosition) => void;
}

/**
 * 읽음 위치 변경 실시간 구독 유스케이스 — 대화 멤버만 구독 가능
 */
@injectable()
export class SubscribeToReadReceipts {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.ReadReceiptRealtimePort)
    private realtime: ReadReceiptRealtimePort,
  ) {}

  async execute(
    input: SubscribeToReadReceiptsInput,
  ): Promise<RealtimeSubscription> {
    const conversationId = createConversationId(input.conversationId);
    const requesterId = createUserId(input.requesterId);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(requesterId)) {
      throw new UnauthorizedError("대화 멤버만 구독할 수 있습니다");
    }

    return this.realtime.onReadPositionChanged(
      input.conversationId,
      input.onReadPosition,
    );
  }
}
