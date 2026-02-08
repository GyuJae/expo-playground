import { describe, it, expect } from "vitest";
import { ReadPosition } from "../../../messaging/value-objects/ReadPosition.js";
import { createConversationId, createUserId } from "../../../shared/types.js";

const CONV_ID = createConversationId("550e8400-e29b-41d4-a716-446655440000");
const USER_ID = createUserId("660e8400-e29b-41d4-a716-446655440000");
const LAST_READ_AT = new Date("2025-06-01T12:00:00Z");

describe("ReadPosition", () => {
  describe("create", () => {
    it("유효한 파라미터로 생성한다", () => {
      const rp = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      expect(rp.conversationId).toBe(CONV_ID);
      expect(rp.userId).toBe(USER_ID);
      expect(rp.lastReadAt).toBe(LAST_READ_AT);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const rp = ReadPosition.reconstruct(CONV_ID, USER_ID, LAST_READ_AT);
      expect(rp.conversationId).toBe(CONV_ID);
      expect(rp.userId).toBe(USER_ID);
      expect(rp.lastReadAt).toBe(LAST_READ_AT);
    });
  });

  describe("hasRead", () => {
    it("lastReadAt 이전 메시지는 true를 반환한다", () => {
      const rp = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      const before = new Date("2025-06-01T11:00:00Z");
      expect(rp.hasRead(before)).toBe(true);
    });

    it("lastReadAt 이후 메시지는 false를 반환한다", () => {
      const rp = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      const after = new Date("2025-06-01T13:00:00Z");
      expect(rp.hasRead(after)).toBe(false);
    });

    it("같은 시각의 메시지는 true를 반환한다 (경계값)", () => {
      const rp = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      const same = new Date("2025-06-01T12:00:00Z");
      expect(rp.hasRead(same)).toBe(true);
    });
  });

  describe("equals", () => {
    it("같은 값이면 동일하다", () => {
      const a = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      const b = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      expect(a.equals(b)).toBe(true);
    });

    it("다른 값이면 다르다", () => {
      const a = ReadPosition.create(CONV_ID, USER_ID, LAST_READ_AT);
      const otherId = createUserId("770e8400-e29b-41d4-a716-446655440000");
      const b = ReadPosition.create(CONV_ID, otherId, LAST_READ_AT);
      expect(a.equals(b)).toBe(false);
    });
  });
});
