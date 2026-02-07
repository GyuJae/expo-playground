import { describe, it, expect } from "vitest";
import { ConversationMember } from "../../../messaging/value-objects/ConversationMember.js";
import { createUserId } from "../../../shared/types.js";

const USER_ID = createUserId("550e8400-e29b-41d4-a716-446655440000");
const JOINED_AT = new Date("2025-01-01T00:00:00Z");

describe("ConversationMember", () => {
  describe("create", () => {
    it("유효한 파라미터로 생성한다", () => {
      const member = ConversationMember.create(USER_ID, JOINED_AT);
      expect(member.userId).toBe(USER_ID);
      expect(member.joinedAt).toBe(JOINED_AT);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const member = ConversationMember.reconstruct(USER_ID, JOINED_AT);
      expect(member.userId).toBe(USER_ID);
      expect(member.joinedAt).toBe(JOINED_AT);
    });
  });

  describe("equals", () => {
    it("같은 userId와 joinedAt이면 동일하다", () => {
      const a = ConversationMember.create(USER_ID, JOINED_AT);
      const b = ConversationMember.create(USER_ID, JOINED_AT);
      expect(a.equals(b)).toBe(true);
    });

    it("다른 userId면 다르다", () => {
      const otherId = createUserId("660e8400-e29b-41d4-a716-446655440000");
      const a = ConversationMember.create(USER_ID, JOINED_AT);
      const b = ConversationMember.create(otherId, JOINED_AT);
      expect(a.equals(b)).toBe(false);
    });
  });
});
