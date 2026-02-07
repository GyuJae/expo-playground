import { injectable, inject } from "tsyringe";
import {
  Conversation,
  ConversationMember,
  createUserId,
  createConversationId,
  type ConversationId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../ports/ConversationRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

interface GetOrCreateConversationInput {
  userId1: string;
  userId2: string;
}

/**
 * 1:1 DM 대화 가져오기 또는 생성 유스케이스
 */
@injectable()
export class GetOrCreateConversation {
  constructor(
    @inject(DI_TOKENS.ConversationRepository)
    private convRepo: ConversationRepository,
  ) {}

  async execute(input: GetOrCreateConversationInput): Promise<Conversation> {
    const userId1 = createUserId(input.userId1);
    const userId2 = createUserId(input.userId2);

    if (userId1 === userId2) {
      throw new Error("자기 자신과 대화를 생성할 수 없습니다");
    }

    const existing = await this.convRepo.findByMembers(userId1, userId2);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const convId = createConversationId(crypto.randomUUID()) as ConversationId;
    const conversation = Conversation.create({
      id: convId,
      members: [
        ConversationMember.create(userId1, now),
        ConversationMember.create(userId2, now),
      ],
      createdAt: now,
    });

    await this.convRepo.save(conversation);
    return conversation;
  }
}
