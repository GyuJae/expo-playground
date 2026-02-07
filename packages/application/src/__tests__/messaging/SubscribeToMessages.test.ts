import { describe, it, expect, vi } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
} from "@expo-playground/domain";
import type { ConversationRepository } from "../../messaging/ports/ConversationRepository.js";
import type { MessageRealtimePort, RealtimeSubscription } from "../../messaging/ports/MessageRealtimePort.js";
import { SubscribeToMessages } from "../../messaging/use-cases/SubscribeToMessages.js";
import { ConversationNotFoundError, UnauthorizedError } from "../../shared/errors.js";

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

function makeConvRepo(conv: Conversation | null = makeConversation()): ConversationRepository {
  return {
    findById: vi.fn().mockResolvedValue(conv),
    findByMembers: vi.fn().mockResolvedValue(null),
    findAllByUserId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeMockSubscription(): RealtimeSubscription {
  return { unsubscribe: vi.fn().mockResolvedValue(undefined) };
}

function makeRealtimePort(sub: RealtimeSubscription = makeMockSubscription()): MessageRealtimePort {
  return {
    onNewMessage: vi.fn().mockReturnValue(sub),
  };
}

describe("SubscribeToMessages", () => {
  it("멤버가 구독에 성공한다", async () => {
    const convRepo = makeConvRepo();
    const realtime = makeRealtimePort();
    const uc = new SubscribeToMessages(convRepo, realtime);
    const callback = vi.fn();

    const sub = await uc.execute({
      conversationId: CONV_ID,
      requesterId: USER_1,
      onMessage: callback,
    });

    expect(realtime.onNewMessage).toHaveBeenCalledWith(CONV_ID, callback);
    expect(sub).toBeDefined();
  });

  it("비멤버가 구독하면 UnauthorizedError를 던진다", async () => {
    const convRepo = makeConvRepo();
    const realtime = makeRealtimePort();
    const uc = new SubscribeToMessages(convRepo, realtime);

    await expect(
      uc.execute({
        conversationId: CONV_ID,
        requesterId: NON_MEMBER,
        onMessage: vi.fn(),
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("대화가 없으면 ConversationNotFoundError를 던진다", async () => {
    const convRepo = makeConvRepo(null);
    const realtime = makeRealtimePort();
    const uc = new SubscribeToMessages(convRepo, realtime);

    await expect(
      uc.execute({
        conversationId: CONV_ID,
        requesterId: USER_1,
        onMessage: vi.fn(),
      }),
    ).rejects.toThrow(ConversationNotFoundError);
  });

  it("구독 해제가 동작한다", async () => {
    const mockSub = makeMockSubscription();
    const convRepo = makeConvRepo();
    const realtime = makeRealtimePort(mockSub);
    const uc = new SubscribeToMessages(convRepo, realtime);

    const sub = await uc.execute({
      conversationId: CONV_ID,
      requesterId: USER_1,
      onMessage: vi.fn(),
    });

    await sub.unsubscribe();
    expect(mockSub.unsubscribe).toHaveBeenCalledOnce();
  });
});
