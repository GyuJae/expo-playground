import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Conversation,
  ConversationMember,
  Message,
  MessageBody,
  ReadPosition,
  createConversationId,
  createMessageId,
  createUserId,
  type ConversationId,
  type MessageId,
} from "@expo-playground/domain";
import { SupabaseReadReceiptRepository } from "../supabase/SupabaseReadReceiptRepository.js";
import { SupabaseConversationRepository } from "../supabase/SupabaseConversationRepository.js";
import { SupabaseMessageRepository } from "../supabase/SupabaseMessageRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const readRepo = new SupabaseReadReceiptRepository(admin);
const convRepo = new SupabaseConversationRepository(admin);
const msgRepo = new SupabaseMessageRepository(admin);

beforeEach(async () => {
  await cleanDatabase(admin);
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

/** 테스트용 메시지 생성 + 저장 */
async function createAndSaveMessage(
  conversationId: ConversationId,
  senderId: string,
  body = "테스트 메시지",
): Promise<Message> {
  const msg = Message.create({
    id: createMessageId(crypto.randomUUID()) as MessageId,
    conversationId,
    senderId: createUserId(senderId),
    body: MessageBody.create(body),
    createdAt: new Date(),
  });
  await msgRepo.save(msg);
  return msg;
}

describe("SupabaseReadReceiptRepository", () => {
  it("읽음 위치를 upsert하고 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const rp = ReadPosition.create(
      conv.id,
      createUserId(user1.id),
      new Date(),
    );
    await readRepo.upsert(rp);

    const found = await readRepo.findByConversationAndUser(
      conv.id,
      createUserId(user1.id),
    );
    expect(found).not.toBeNull();
    expect(found!.conversationId).toBe(conv.id);
    expect(found!.userId).toBe(user1.id);
  });

  it("읽음 위치가 없으면 null을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const found = await readRepo.findByConversationAndUser(
      conv.id,
      createUserId(user1.id),
    );
    expect(found).toBeNull();
  });

  it("읽음 위치를 갱신한다 (upsert)", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const first = ReadPosition.create(
      conv.id,
      createUserId(user1.id),
      new Date("2025-01-01T00:00:00Z"),
    );
    await readRepo.upsert(first);

    const updated = ReadPosition.create(
      conv.id,
      createUserId(user1.id),
      new Date("2025-06-01T00:00:00Z"),
    );
    await readRepo.upsert(updated);

    const found = await readRepo.findByConversationAndUser(
      conv.id,
      createUserId(user1.id),
    );
    expect(found!.lastReadAt.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("대화의 모든 멤버 읽음 위치를 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user1.id), new Date()),
    );
    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user2.id), new Date()),
    );

    const all = await readRepo.findAllByConversationId(conv.id);
    expect(all).toHaveLength(2);
  });

  it("읽음 위치가 없을 때 모든 메시지를 안 읽음으로 카운트한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    await createAndSaveMessage(conv.id, user2.id, "메시지 1");
    await createAndSaveMessage(conv.id, user2.id, "메시지 2");

    const count = await readRepo.countUnread(conv.id, createUserId(user1.id));
    expect(count).toBe(2);
  });

  it("읽은 후 새 메시지만 안 읽음으로 카운트한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    await createAndSaveMessage(conv.id, user2.id, "이전 메시지");

    // user1이 읽음 처리
    const readAt = new Date();
    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user1.id), readAt),
    );

    // 약간 대기 후 새 메시지
    await new Promise((r) => setTimeout(r, 50));
    await createAndSaveMessage(conv.id, user2.id, "새 메시지");

    const count = await readRepo.countUnread(conv.id, createUserId(user1.id));
    expect(count).toBe(1);
  });

  it("모든 메시지를 읽었으면 0을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    await createAndSaveMessage(conv.id, user2.id, "메시지");

    // 충분히 미래로 읽음 처리
    await new Promise((r) => setTimeout(r, 50));
    await readRepo.upsert(
      ReadPosition.create(conv.id, createUserId(user1.id), new Date()),
    );

    const count = await readRepo.countUnread(conv.id, createUserId(user1.id));
    expect(count).toBe(0);
  });

  it("메시지가 없는 대화에서 0을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const count = await readRepo.countUnread(conv.id, createUserId(user1.id));
    expect(count).toBe(0);
  });
});
