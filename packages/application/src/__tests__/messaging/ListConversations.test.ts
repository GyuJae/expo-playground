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
import { ListConversations } from "../../messaging/use-cases/ListConversations.js";

const USER_1 = "550e8400-e29b-41d4-a716-446655440000";
const CONV_ID = "660e8400-e29b-41d4-a716-446655440000";

function makeConversation(id: string) {
  return Conversation.create({
    id: createConversationId(id),
    members: [
      ConversationMember.create(createUserId(USER_1), new Date()),
      ConversationMember.create(
        createUserId("770e8400-e29b-41d4-a716-446655440000"),
        new Date(),
      ),
    ],
    createdAt: new Date(),
  });
}

function makeMessage(convId: string) {
  return Message.create({
    id: createMessageId("880e8400-e29b-41d4-a716-446655440000"),
    conversationId: createConversationId(convId),
    senderId: createUserId(USER_1),
    body: MessageBody.create("마지막 메시지"),
    createdAt: new Date(),
  });
}

function makeConvRepo(convs: Conversation[] = []): ConversationRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByMembers: vi.fn().mockResolvedValue(null),
    findAllByUserId: vi.fn().mockResolvedValue(convs),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeMsgRepo(msg: Message | null = null): MessageRepository {
  return {
    findByConversationId: vi.fn().mockResolvedValue([]),
    findLatestByConversationId: vi.fn().mockResolvedValue(msg),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ListConversations", () => {
  it("대화 목록과 마지막 메시지를 반환한다", async () => {
    const conv = makeConversation(CONV_ID);
    const msg = makeMessage(CONV_ID);
    const convRepo = makeConvRepo([conv]);
    const msgRepo = makeMsgRepo(msg);
    const uc = new ListConversations(convRepo, msgRepo);

    const result = await uc.execute(USER_1);

    expect(result).toHaveLength(1);
    expect(result[0]!.conversation.id).toBe(CONV_ID);
    expect(result[0]!.lastMessage?.body.value).toBe("마지막 메시지");
  });

  it("대화가 없으면 빈 배열을 반환한다", async () => {
    const convRepo = makeConvRepo([]);
    const msgRepo = makeMsgRepo();
    const uc = new ListConversations(convRepo, msgRepo);

    const result = await uc.execute(USER_1);
    expect(result).toHaveLength(0);
  });

  it("마지막 메시지가 없으면 null을 반환한다", async () => {
    const conv = makeConversation(CONV_ID);
    const convRepo = makeConvRepo([conv]);
    const msgRepo = makeMsgRepo(null);
    const uc = new ListConversations(convRepo, msgRepo);

    const result = await uc.execute(USER_1);
    expect(result[0]!.lastMessage).toBeNull();
  });
});
