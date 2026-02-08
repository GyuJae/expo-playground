import { injectable, inject } from "tsyringe";
import {
  createUserId,
  type Conversation,
  type Message,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { MessageRepository } from "../ports/MessageRepository.js";
import type { ReadReceiptRepository } from "../ports/ReadReceiptRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/** 대화 요약 — 마지막 메시지 + 안 읽은 수 포함 */
export interface ConversationSummary {
  conversation: Conversation;
  lastMessage: Message | null;
  unreadCount: number;
}

/**
 * 사용자의 대화 목록 조회 유스케이스 — 마지막 메시지 미리보기 + 안 읽은 수 포함
 */
@injectable()
export class ListConversations {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.MessageRepository)
    private msgRepo: MessageRepository,
    @inject(DI_TOKENS.ReadReceiptRepository)
    private readReceiptRepo: ReadReceiptRepository,
  ) {}

  async execute(userId: string): Promise<ConversationSummary[]> {
    const id = createUserId(userId);
    const conversations = await this.convRepo.findAllByUserId(id);

    const summaries: ConversationSummary[] = await Promise.all(
      conversations.map(async (conversation) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.msgRepo.findLatestByConversationId(conversation.id),
          this.readReceiptRepo.countUnread(conversation.id, id),
        ]);
        return { conversation, lastMessage, unreadCount };
      }),
    );

    return summaries;
  }
}
