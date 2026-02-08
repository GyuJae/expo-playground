import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../../messaging/ports/ReadReceiptRepository.js";
import { MarkConversationAsRead } from "../../messaging/use-cases/MarkConversationAsRead.js";
import { ConversationNotFoundError, UnauthorizedError } from "../../shared/errors.js";

const USER_1 = "550e8400-e29b-41d4-a716-446655440000";
const USER_2 = "660e8400-e29b-41d4-a716-446655440000";
const NON_MEMBER = "770e8400-e29b-41d4-a716-446655440000";
const CONV_ID = "880e8400-e29b-41d4-a716-446655440000";

function makeConversation() {
  return Conversation.create({
    id: createConversationId(CONV_ID),
    members: [
      ConversationMember.create(createUserId(USER_1), new Date()),
      ConversationMember.create(createUserId(USER_2), new Date()),
    ],
    createdAt: new Date(),
  });
}

function makeConvRepo(conv: Conversation | null = makeConversation()): ConversationRepository {
  return {
    findById: vi.fn().mockResolvedValue(conv),
    findByMembers: vi.fn().mockResolvedValue(null),
    findAllByUserId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeReadReceiptRepo(): ReadReceiptRepository {
  return {
    findByConversationAndUser: vi.fn().mockResolvedValue(null),
    findAllByConversationId: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue(undefined),
    countUnread: vi.fn().mockResolvedValue(0),
  };
}

describe("MarkConversationAsRead", () => {
  it("멤버가 읽음 처리에 성공한다", async () => {
    const convRepo = makeConvRepo();
    const readRepo = makeReadReceiptRepo();
    const uc = new MarkConversationAsRead(convRepo, readRepo);

    await uc.execute({ conversationId: CONV_ID, userId: USER_1 });

    expect(readRepo.upsert).toHaveBeenCalledOnce();
    const arg = (readRepo.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(arg.conversationId).toBe(CONV_ID);
    expect(arg.userId).toBe(USER_1);
  });

  it("대화가 없으면 ConversationNotFoundError를 던진다", async () => {
    const convRepo = makeConvRepo(null);
    const readRepo = makeReadReceiptRepo();
    const uc = new MarkConversationAsRead(convRepo, readRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, userId: USER_1 }),
    ).rejects.toThrow(ConversationNotFoundError);
  });

  it("비멤버가 읽음 처리하면 UnauthorizedError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const readRepo = makeReadReceiptRepo();
    const uc = new MarkConversationAsRead(convRepo, readRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, userId: NON_MEMBER }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("upsert에 현재 시각을 전달한다", async () => {
    const convRepo = makeConvRepo();
    const readRepo = makeReadReceiptRepo();
    const uc = new MarkConversationAsRead(convRepo, readRepo);
    const before = new Date();

    await uc.execute({ conversationId: CONV_ID, userId: USER_1 });

    const arg = (readRepo.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(arg.lastReadAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
