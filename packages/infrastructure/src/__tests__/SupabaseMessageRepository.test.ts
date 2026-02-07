import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
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
import { SupabaseMessageRepository } from "../supabase/SupabaseMessageRepository.js";
import { SupabaseConversationRepository } from "../supabase/SupabaseConversationRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const msgRepo = new SupabaseMessageRepository(admin);
const convRepo = new SupabaseConversationRepository(admin);

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

/** 테스트용 메시지 생성 */
function createTestMessage(
  conversationId: ConversationId,
  senderId: string,
  body = "테스트 메시지",
) {
  return Message.create({
    id: createMessageId(crypto.randomUUID()) as MessageId,
    conversationId,
    senderId: createUserId(senderId),
    body: MessageBody.create(body),
    createdAt: new Date(),
  });
}

describe("SupabaseMessageRepository", () => {
  it("메시지를 저장하고 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);
    const msg = createTestMessage(conv.id, user1.id);

    await msgRepo.save(msg);

    const list = await msgRepo.findByConversationId(conv.id);
    expect(list).toHaveLength(1);
    expect(list[0]!.body.value).toBe("테스트 메시지");
  });

  it("대화별 메시지를 오래된 순으로 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const m1 = createTestMessage(conv.id, user1.id, "첫 번째");
    const m2 = createTestMessage(conv.id, user2.id, "두 번째");
    await msgRepo.save(m1);
    await msgRepo.save(m2);

    const list = await msgRepo.findByConversationId(conv.id);
    expect(list).toHaveLength(2);
    expect(list[0]!.body.value).toBe("첫 번째");
    expect(list[1]!.body.value).toBe("두 번째");
  });

  it("최신 메시지 1개를 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const m1 = createTestMessage(conv.id, user1.id, "첫 번째");
    const m2 = createTestMessage(conv.id, user2.id, "마지막");
    await msgRepo.save(m1);
    await msgRepo.save(m2);

    const latest = await msgRepo.findLatestByConversationId(conv.id);
    expect(latest).not.toBeNull();
    expect(latest!.body.value).toBe("마지막");
  });

  it("메시지가 없는 대화에서 빈 배열을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const list = await msgRepo.findByConversationId(conv.id);
    expect(list).toHaveLength(0);
  });

  it("메시지가 없는 대화에서 최신 메시지 조회 시 null을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = await createAndSaveConversation(user1.id, user2.id);

    const latest = await msgRepo.findLatestByConversationId(conv.id);
    expect(latest).toBeNull();
  });
});
