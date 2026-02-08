import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  Conversation,
  ConversationMember,
  ReadPosition,
  createConversationId,
  createUserId,
  type ConversationId,
} from "@expo-playground/domain";
import { SupabaseConversationRepository } from "../supabase/SupabaseConversationRepository.js";
import { SupabaseReadReceiptRepository } from "../supabase/SupabaseReadReceiptRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";
import type { RealtimeChannel } from "@supabase/supabase-js";

const admin = createAdminClient();
const convRepo = new SupabaseConversationRepository(admin);
const readRepo = new SupabaseReadReceiptRepository(admin);

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

describe("SupabaseReadReceiptRealtime", () => {
  it("INSERT 이벤트를 수신한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-read-receipts:${conv.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "read_receipts",
          filter: `conversation_id=eq.${conv.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // 읽음 위치 삽입
    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user1.id), new Date()),
    );

    await waitFor(() => received.length >= 1);

    expect(received).toHaveLength(1);
    expect((received[0] as { user_id: string }).user_id).toBe(user1.id);
  }, 15000);

  it("UPDATE 이벤트를 수신한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    // 먼저 INSERT
    await readRepo.upsert(
      ReadPosition.create(
        conv.id,
        createUserId(user1.id),
        new Date("2025-01-01T00:00:00Z"),
      ),
    );

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-read-receipts-update:${conv.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "read_receipts",
          filter: `conversation_id=eq.${conv.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // UPDATE
    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user1.id), new Date()),
    );

    await waitFor(() => received.length >= 1);

    expect(received.length).toBeGreaterThanOrEqual(1);
  }, 15000);
});
