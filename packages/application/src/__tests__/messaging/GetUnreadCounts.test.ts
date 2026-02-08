import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { ReadReceiptRepository } from "../../messaging/ports/ReadReceiptRepository.js";
import { GetUnreadCounts } from "../../messaging/use-cases/GetUnreadCounts.js";

const USER_1 = "550e8400-e29b-41d4-a716-446655440000";
const CONV_1 = "660e8400-e29b-41d4-a716-446655440000";
const CONV_2 = "770e8400-e29b-41d4-a716-446655440000";

function makeConversation(id: string) {
  return Conversation.create({
    id: createConversationId(id),
    members: [
      ConversationMember.create(createUserId(USER_1), new Date()),
      ConversationMember.create(
        createUserId("880e8400-e29b-41d4-a716-446655440000"),
        new Date(),
      ),
    ],
    createdAt: new Date(),
  });
}

describe("GetUnreadCounts", () => {
  it("각 대화의 안 읽은 수를 반환한다", async () => {
    const convRepo: ConversationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByMembers: vi.fn().mockResolvedValue(null),
      findAllByUserId: vi.fn().mockResolvedValue([
        makeConversation(CONV_1),
        makeConversation(CONV_2),
      ]),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn()
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0),
    };

    const uc = new GetUnreadCounts(convRepo, readRepo);
    const result = await uc.execute(USER_1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ conversationId: CONV_1, count: 3 });
    expect(result[1]).toEqual({ conversationId: CONV_2, count: 0 });
  });

  it("대화가 없으면 빈 배열을 반환한다", async () => {
    const convRepo: ConversationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByMembers: vi.fn().mockResolvedValue(null),
      findAllByUserId: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn().mockResolvedValue(0),
    };

    const uc = new GetUnreadCounts(convRepo, readRepo);
    const result = await uc.execute(USER_1);

    expect(result).toHaveLength(0);
  });

  it("모든 메시지를 읽었으면 count가 0이다", async () => {
    const convRepo: ConversationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByMembers: vi.fn().mockResolvedValue(null),
      findAllByUserId: vi.fn().mockResolvedValue([makeConversation(CONV_1)]),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const readRepo: ReadReceiptRepository = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      findAllByConversationId: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue(undefined),
      countUnread: vi.fn().mockResolvedValue(0),
    };

    const uc = new GetUnreadCounts(convRepo, readRepo);
    const result = await uc.execute(USER_1);

    expect(result[0]!.count).toBe(0);
  });
});
