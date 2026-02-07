import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
  InvalidUuidError,
  InvalidMessageBodyError,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { MessageRepository } from "../../messaging/ports/MessageRepository.js";
import { SendMessage } from "../../messaging/use-cases/SendMessage.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

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

function makeMsgRepo(): MessageRepository {
  return {
    findByConversationId: vi.fn().mockResolvedValue([]),
    findLatestByConversationId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("SendMessage", () => {
  it("메시지를 생성하고 저장한다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new SendMessage(convRepo, msgRepo);

    const result = await uc.execute({
      conversationId: CONV_ID,
      senderId: USER_1,
      body: "안녕하세요",
    });

    expect(result.body.value).toBe("안녕하세요");
    expect(result.conversationId).toBe(CONV_ID);
    expect(result.senderId).toBe(USER_1);
    expect(msgRepo.save).toHaveBeenCalledOnce();
  });

  it("대화가 없으면 ConversationNotFoundError를 던진다", async () => {
    const convRepo = makeConvRepo(null);
    const msgRepo = makeMsgRepo();
    const uc = new SendMessage(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, senderId: USER_1, body: "안녕" }),
    ).rejects.toThrow(ConversationNotFoundError);
  });

  it("비멤버가 전송하면 UnauthorizedError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new SendMessage(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, senderId: NON_MEMBER, body: "안녕" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("빈 body이면 InvalidMessageBodyError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new SendMessage(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, senderId: USER_1, body: "" }),
    ).rejects.toThrow(InvalidMessageBodyError);
  });

  it("유효하지 않은 conversationId이면 InvalidUuidError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new SendMessage(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: "bad", senderId: USER_1, body: "안녕" }),
    ).rejects.toThrow(InvalidUuidError);
  });
});
