import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
  InvalidUuidError,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import { GetOrCreateConversation } from "../../messaging/use-cases/GetOrCreateConversation.js";

const USER_1 = "550e8400-e29b-41d4-a716-446655440000";
const USER_2 = "660e8400-e29b-41d4-a716-446655440000";
const CONV_ID = "770e8400-e29b-41d4-a716-446655440000";

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

function makeConvRepo(existing: Conversation | null = null): ConversationRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByMembers: vi.fn().mockResolvedValue(existing),
    findAllByUserId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("GetOrCreateConversation", () => {
  it("기존 대화가 없으면 새로 생성한다", async () => {
    const convRepo = makeConvRepo(null);
    const uc = new GetOrCreateConversation(convRepo);

    const result = await uc.execute({ userId1: USER_1, userId2: USER_2 });

    expect(result.members).toHaveLength(2);
    expect(result.isMember(createUserId(USER_1))).toBe(true);
    expect(result.isMember(createUserId(USER_2))).toBe(true);
    expect(convRepo.save).toHaveBeenCalledOnce();
  });

  it("기존 대화가 있으면 그대로 반환한다", async () => {
    const existing = makeConversation();
    const convRepo = makeConvRepo(existing);
    const uc = new GetOrCreateConversation(convRepo);

    const result = await uc.execute({ userId1: USER_1, userId2: USER_2 });

    expect(result.id).toBe(CONV_ID);
    expect(convRepo.save).not.toHaveBeenCalled();
  });

  it("같은 사용자끼리 대화 생성 시 에러를 던진다", async () => {
    const convRepo = makeConvRepo();
    const uc = new GetOrCreateConversation(convRepo);

    await expect(
      uc.execute({ userId1: USER_1, userId2: USER_1 }),
    ).rejects.toThrow("자기 자신");
  });

  it("유효하지 않은 userId이면 InvalidUuidError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const uc = new GetOrCreateConversation(convRepo);

    await expect(
      uc.execute({ userId1: "bad", userId2: USER_2 }),
    ).rejects.toThrow(InvalidUuidError);
  });
});
