import { injectable, inject } from "tsyringe";
import {
  createConversationId,
  createUserId,
  type ReadPosition,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../ports/ReadReceiptRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

interface GetReadPositionsInput {
  conversationId: string;
  requesterId: string;
}

/**
 * 대화 멤버들의 읽음 위치 조회 유스케이스
 */
@injectable()
export class GetReadPositions {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.ReadReceiptRepository)
    private readReceiptRepo: ReadReceiptRepository,
  ) {}

  async execute(input: GetReadPositionsInput): Promise<ReadPosition[]> {
    const conversationId = createConversationId(input.conversationId);
    const requesterId = createUserId(input.requesterId);

    const conversation = await this.convRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(input.conversationId);
    }

    if (!conversation.isMember(requesterId)) {
      throw new UnauthorizedError("대화 멤버만 읽음 위치를 조회할 수 있습니다");
    }

    return this.readReceiptRepo.findAllByConversationId(conversationId);
  }
}
