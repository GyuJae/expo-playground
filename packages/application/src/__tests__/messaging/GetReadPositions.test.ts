import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  ReadPosition,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../../messaging/ports/ReadReceiptRepository.js";
import { GetReadPositions } from "../../messaging/use-cases/GetReadPositions.js";
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

describe("GetReadPositions", () => {
  it("대화 멤버들의 읽음 위치를 반환한다", async () => {
    const positions = [
      ReadPosition.create(createConversationId(CONV_ID), createUserId(USER_1), new Date()),
      ReadPosition.create(createConversationId(CONV_ID), createUserId(USER_2), new Date()),
    ];
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue(positions),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn().mockResolvedValue(0),
    };
    const uc = new GetReadPositions(makeConvRepo(), readRepo);

    const result = await uc.execute({ conversationId: CONV_ID, requesterId: USER_1 });
    expect(result).toHaveLength(2);
  });

  it("대화가 없으면 ConversationNotFoundError를 던진다", async () => {
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn().mockResolvedValue(0),
    };
    const uc = new GetReadPositions(makeConvRepo(null), readRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, requesterId: USER_1 }),
    ).rejects.toThrow(ConversationNotFoundError);
  });

  it("비멤버가 조회하면 UnauthorizedError를 던진다", async () => {
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn().mockResolvedValue(0),
    };
    const uc = new GetReadPositions(makeConvRepo(), readRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, requesterId: NON_MEMBER }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
