import { describe, it, expect } from "vitest";
import { Conversation } from "../../../messaging/entities/Conversation.js";
import { ConversationMember } from "../../../messaging/value-objects/ConversationMember.js";
import {
  createConversationId,
  createUserId,
} from "../../../shared/types.js";

const CONV_ID = createConversationId("550e8400-e29b-41d4-a716-446655440000");
const USER_1 = createUserId("660e8400-e29b-41d4-a716-446655440000");
const USER_2 = createUserId("770e8400-e29b-41d4-a716-446655440000");
const USER_3 = createUserId("880e8400-e29b-41d4-a716-446655440000");
const CREATED_AT = new Date("2025-01-01T00:00:00Z");

function createTestConversation() {
  return Conversation.create({
    id: CONV_ID,
    members: [
      ConversationMember.create(USER_1, CREATED_AT),
      ConversationMember.create(USER_2, CREATED_AT),
    ],
    createdAt: CREATED_AT,
  });
}

describe("Conversation", () => {
  describe("create", () => {
    it("유효한 파라미터로 Conversation을 생성한다", () => {
      const conv = createTestConversation();
      expect(conv.id).toBe(CONV_ID);
      expect(conv.createdAt).toBe(CREATED_AT);
      expect(conv.members).toHaveLength(2);
    });

    it("멤버 userId에 접근할 수 있다", () => {
      const conv = createTestConversation();
      expect(conv.members[0].userId).toBe(USER_1);
      expect(conv.members[1].userId).toBe(USER_2);
    });
  });

  describe("isMember", () => {
    it("멤버인 사용자에 대해 true를 반환한다", () => {
      const conv = createTestConversation();
      expect(conv.isMember(USER_1)).toBe(true);
      expect(conv.isMember(USER_2)).toBe(true);
    });

    it("멤버가 아닌 사용자에 대해 false를 반환한다", () => {
      const conv = createTestConversation();
      expect(conv.isMember(USER_3)).toBe(false);
    });
  });

  describe("equals", () => {
    it("같은 ID의 Conversation은 동일하다", () => {
      const a = createTestConversation();
      const b = createTestConversation();
      expect(a.equals(b)).toBe(true);
    });

    it("다른 ID의 Conversation은 다르다", () => {
      const a = createTestConversation();
      const b = Conversation.create({
        id: createConversationId("990e8400-e29b-41d4-a716-446655440000"),
        members: [ConversationMember.create(USER_1, CREATED_AT)],
        createdAt: CREATED_AT,
      });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const conv = Conversation.reconstruct({
        id: CONV_ID,
        members: [
          ConversationMember.reconstruct(USER_1, CREATED_AT),
          ConversationMember.reconstruct(USER_2, CREATED_AT),
        ],
        createdAt: CREATED_AT,
      });
      expect(conv.id).toBe(CONV_ID);
      expect(conv.members).toHaveLength(2);
      expect(conv.isMember(USER_1)).toBe(true);
    });
  });

  describe("members 불변성", () => {
    it("외부에서 members 배열을 수정해도 내부에 영향 없다", () => {
      const members = [
        ConversationMember.create(USER_1, CREATED_AT),
        ConversationMember.create(USER_2, CREATED_AT),
      ];
      const conv = Conversation.create({
        id: CONV_ID,
        members,
        createdAt: CREATED_AT,
      });

      members.push(ConversationMember.create(USER_3, CREATED_AT));
      expect(conv.members).toHaveLength(2);
    });
  });
});
