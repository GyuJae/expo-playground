import { injectable, inject } from "tsyringe";
import {
  createUserId,
  type Conversation,
  type Message,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import type { MessageRepository } from "../ports/MessageRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/** 대화 요약 — 마지막 메시지 포함 */
export interface ConversationSummary {
  conversation: Conversation;
  lastMessage: Message | null;
}

/**
 * 사용자의 대화 목록 조회 유스케이스 — 마지막 메시지 미리보기 포함
 */
@injectable()
export class ListConversations {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
    @inject(DI_TOKENS.MessageRepository)
    private msgRepo: MessageRepository,
  ) {}

  async execute(userId: string): Promise<ConversationSummary[]> {
    const id = createUserId(userId);
    const conversations = await this.convRepo.findAllByUserId(id);

    const summaries: ConversationSummary[] = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage =
          await this.msgRepo.findLatestByConversationId(conversation.id);
        return { conversation, lastMessage };
      }),
    );

    return summaries;
  }
}
