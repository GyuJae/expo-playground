import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  Message,
  MessageBody,
  createConversationId,
  createMessageId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { MessageRepository } from "../../messaging/ports/MessageRepository.js";
import { ListMessages } from "../../messaging/use-cases/ListMessages.js";
import {
  ConversationNotFoundError,
  UnauthorizedError,
} from "../../shared/errors.js";

const USER_1 = "550e8400-e29b-41d4-a716-446655440000";
const NON_MEMBER = "770e8400-e29b-41d4-a716-446655440000";
const CONV_ID = "880e8400-e29b-41d4-a716-446655440000";

function makeConversation() {
  return Conversation.create({
    id: createConversationId(CONV_ID),
    members: [
      ConversationMember.create(createUserId(USER_1), new Date()),
      ConversationMember.create(
        createUserId("660e8400-e29b-41d4-a716-446655440000"),
        new Date(),
      ),
    ],
    createdAt: new Date(),
  });
}

function makeMessages(): Message[] {
  return [
    Message.create({
      id: createMessageId("110e8400-e29b-41d4-a716-446655440000"),
      conversationId: createConversationId(CONV_ID),
      senderId: createUserId(USER_1),
      body: MessageBody.create("첫 번째"),
      createdAt: new Date("2025-01-01"),
    }),
    Message.create({
      id: createMessageId("220e8400-e29b-41d4-a716-446655440000"),
      conversationId: createConversationId(CONV_ID),
      senderId: createUserId(USER_1),
      body: MessageBody.create("두 번째"),
      createdAt: new Date("2025-01-02"),
    }),
  ];
}

function makeConvRepo(conv: Conversation | null = makeConversation()): ConversationRepository {
  return {
    findById: vi.fn().mockResolvedValue(conv),
    findByMembers: vi.fn().mockResolvedValue(null),
    findAllByUserId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeMsgRepo(msgs: Message[] = makeMessages()): MessageRepository {
  return {
    findByConversationId: vi.fn().mockResolvedValue(msgs),
    findLatestByConversationId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ListMessages", () => {
  it("대화의 메시지 목록을 반환한다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new ListMessages(convRepo, msgRepo);

    const result = await uc.execute({
      conversationId: CONV_ID,
      requesterId: USER_1,
    });

    expect(result).toHaveLength(2);
    expect(msgRepo.findByConversationId).toHaveBeenCalledOnce();
  });

  it("대화가 없으면 ConversationNotFoundError를 던진다", async () => {
    const convRepo = makeConvRepo(null);
    const msgRepo = makeMsgRepo();
    const uc = new ListMessages(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, requesterId: USER_1 }),
    ).rejects.toThrow(ConversationNotFoundError);
  });

  it("비멤버가 조회하면 UnauthorizedError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo();
    const uc = new ListMessages(convRepo, msgRepo);

    await expect(
      uc.execute({ conversationId: CONV_ID, requesterId: NON_MEMBER }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("메시지가 없으면 빈 배열을 반환한다", async () => {
    const convRepo = makeConvRepo();
    const msgRepo = makeMsgRepo([]);
    const uc = new ListMessages(convRepo, msgRepo);

    const result = await uc.execute({
      conversationId: CONV_ID,
      requesterId: USER_1,
    });

    expect(result).toHaveLength(0);
  });
});
