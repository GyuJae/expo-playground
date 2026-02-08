import { injectable, inject } from "tsyringe";
import { createUserId } from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../ports/ReadReceiptRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/** 대화별 안 읽은 메시지 수 */
export interface UnreadCount {
  conversationId: string;
  count: number;
}

/**
 * 모든 대화의 안 읽은 메시지 수 조회 유스케이스
 */
@injectable()
export class GetUnreadCounts {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.ReadReceiptRepository)
    private readReceiptRepo: ReadReceiptRepository,
  ) {}

  async execute(userId: string): Promise<UnreadCount[]> {
    const id = createUserId(userId);
    const conversations = await this.convRepo.findAllByUserId(id);

    return Promise.all(
      conversations.map(async (conv) => ({
        conversationId: conv.id as string,
        count: await this.readReceiptRepo.countUnread(conv.id, id),
      })),
    );
  }
}
