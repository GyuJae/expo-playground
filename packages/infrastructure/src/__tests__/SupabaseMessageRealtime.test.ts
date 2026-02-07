import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  Conversation,
  ConversationMember,
  Message,
  MessageBody,
  createConversationId,
  createMessageId,
  createUserId,
  type ConversationId,
  type MessageId,
} from "@expo-playground/domain";
import { SupabaseConversationRepository } from "../supabase/SupabaseConversationRepository.js";
import { SupabaseMessageRepository } from "../supabase/SupabaseMessageRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";
import type { RealtimeChannel } from "@supabase/supabase-js";

const admin = createAdminClient();
const convRepo = new SupabaseConversationRepository(admin);
const msgRepo = new SupabaseMessageRepository(admin);

let activeChannel: RealtimeChannel | null = null;

beforeEach(async () => {
  await cleanDatabase(admin);
});

afterEach(async () => {
  if (activeChannel) {
    await admin.removeChannel(activeChannel);
    activeChannel = null;
  }
});

/** 테스트용 대화 생성 + 저장 */
async function createAndSaveConversation(
  userId1: string,
  userId2: string,
): Promise<Conversation> {
  const now = new Date();
  const conv = Conversation.create({
    id: createConversationId(crypto.randomUUID()) as ConversationId,
    members: [
      ConversationMember.create(createUserId(userId1), now),
      ConversationMember.create(createUserId(userId2), now),
    ],
    createdAt: now,
  });
  await convRepo.save(conv);
  return conv;
}

/** 채널 구독이 SUBSCRIBED 상태가 될 때까지 대기 */
function waitForSubscribed(channel: RealtimeChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("구독 타임아웃")), 5000);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}

/** 조건이 충족될 때까지 폴링 */
async function waitFor(
  condition: () => boolean,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitFor 타임아웃");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

describe("SupabaseMessageRealtime", () => {
  it("INSERT 이벤트를 수신한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-messages:${conv.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conv.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // 메시지 삽입
    const msg = Message.create({
      id: createMessageId(crypto.randomUUID()) as MessageId,
      conversationId: conv.id,
      senderId: createUserId(user1.id),
      body: MessageBody.create("실시간 메시지"),
      createdAt: new Date(),
    });
    await msgRepo.save(msg);

    await waitFor(() => received.length >= 1);

    expect(received).toHaveLength(1);
    expect((received[0] as { body: string }).body).toBe("실시간 메시지");
  }, 15000);

  it("다른 대화의 메시지는 수신하지 않는다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const user3 = await createTestAuthUser(admin);
    const conv1 = await createAndSaveConversation(user1.id, user2.id);
    const conv2 = await createAndSaveConversation(user1.id, user3.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-messages:${conv1.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conv1.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // conv2에 메시지 삽입
    const msg = Message.create({
      id: createMessageId(crypto.randomUUID()) as MessageId,
      conversationId: conv2.id,
      senderId: createUserId(user1.id),
      body: MessageBody.create("다른 대화"),
      createdAt: new Date(),
    });
    await msgRepo.save(msg);

    // 충분한 시간 대기 후 수신 없음 확인
    await new Promise((r) => setTimeout(r, 2000));
    expect(received).toHaveLength(0);
  }, 10000);

  it("구독 해제 후 이벤트를 수신하지 않는다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-messages-unsub:${conv.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conv.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    await waitForSubscribed(channel);

    // 구독 해제
    await admin.removeChannel(channel);

    // 메시지 삽입
    const msg = Message.create({
      id: createMessageId(crypto.randomUUID()) as MessageId,
      conversationId: conv.id,
      senderId: createUserId(user1.id),
      body: MessageBody.create("구독 해제 후"),
      createdAt: new Date(),
    });
    await msgRepo.save(msg);

    await new Promise((r) => setTimeout(r, 2000));
    expect(received).toHaveLength(0);
  }, 10000);
});
