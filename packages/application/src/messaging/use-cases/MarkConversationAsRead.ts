import { injectable, inject } from "tsyringe";
import {
  ReadPosition,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../ports/ReadReceiptRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

interface MarkConversationAsReadInput {
  conversationId: string;
  userId: string;
}

/**
 * 대화 읽음 처리 유스케이스 — 대화를 열 때 last_read_at을 현재 시각으로 갱신
 */
@injectable()
export class MarkConversationAsRead {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.ReadReceiptRepository)
    private readReceiptRepo: ReadReceiptRepository,
  ) {}

  async execute(input: MarkConversationAsReadInput): Promise<void> {
    const conversationId = createConversationId(input.conversationId);
    const userId = createUserId(input.userId);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(userId)) {
      throw new UnauthorizedError("대화 멤버만 읽음 처리할 수 있습니다");
    }

    const readPosition = ReadPosition.create(conversationId, userId, new Date());
    await this.readReceiptRepo.upsert(readPosition);
  }
}
