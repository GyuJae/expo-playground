import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Conversation,
  ConversationMember,
  createConversationId,
  createUserId,
  type ConversationId,
} from "@expo-playground/domain";
import { SupabaseConversationRepository } from "../supabase/SupabaseConversationRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const repo = new SupabaseConversationRepository(admin);

beforeEach(async () => {
  await cleanDatabase(admin);
});

/** 테스트용 Conversation 생성 */
function createTestConversation(userId1: string, userId2: string) {
  const now = new Date();
  return Conversation.create({
    id: createConversationId(crypto.randomUUID()) as ConversationId,
    members: [
      ConversationMember.create(createUserId(userId1), now),
      ConversationMember.create(createUserId(userId2), now),
    ],
    createdAt: now,
  });
}

describe("SupabaseConversationRepository", () => {
  it("대화를 생성하고 멤버와 함께 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = createTestConversation(user1.id, user2.id);

    await repo.save(conv);

    const found = await repo.findById(conv.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conv.id);
    expect(found!.members).toHaveLength(2);
  });

  it("멤버 쌍으로 대화를 검색한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = createTestConversation(user1.id, user2.id);
    await repo.save(conv);

    const found = await repo.findByMembers(
      createUserId(user1.id),
      createUserId(user2.id),
    );
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conv.id);
  });

  it("역순 멤버 쌍으로도 대화를 검색한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const conv = createTestConversation(user1.id, user2.id);
    await repo.save(conv);

    const found = await repo.findByMembers(
      createUserId(user2.id),
      createUserId(user1.id),
    );
    expect(found).not.toBeNull();
    expect(found!.id).toBe(conv.id);
  });

  it("멤버 쌍에 해당하는 대화가 없으면 null을 반환한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);

    const found = await repo.findByMembers(
      createUserId(user1.id),
      createUserId(user2.id),
    );
    expect(found).toBeNull();
  });

  it("사용자별 대화 목록을 조회한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const user3 = await createTestAuthUser(admin);

    const conv1 = createTestConversation(user1.id, user2.id);
    const conv2 = createTestConversation(user1.id, user3.id);
    await repo.save(conv1);
    await repo.save(conv2);

    const list = await repo.findAllByUserId(createUserId(user1.id));
    expect(list).toHaveLength(2);
  });

  it("다른 사용자의 대화는 포함되지 않는다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const user3 = await createTestAuthUser(admin);

    const conv = createTestConversation(user1.id, user2.id);
    await repo.save(conv);

    const list = await repo.findAllByUserId(createUserId(user3.id));
    expect(list).toHaveLength(0);
  });

  it("존재하지 않는 대화 조회 시 null을 반환한다", async () => {
    const fakeId = createConversationId("00000000-0000-0000-0000-000000000000");
    const found = await repo.findById(fakeId);
    expect(found).toBeNull();
  });

  it("isMember가 올바르게 동작한다", async () => {
    const user1 = await createTestAuthUser(admin);
    const user2 = await createTestAuthUser(admin);
    const user3 = await createTestAuthUser(admin);
    const conv = createTestConversation(user1.id, user2.id);
    await repo.save(conv);

    const found = await repo.findById(conv.id);
    expect(found!.isMember(createUserId(user1.id))).toBe(true);
    expect(found!.isMember(createUserId(user2.id))).toBe(true);
    expect(found!.isMember(createUserId(user3.id))).toBe(false);
  });
});
