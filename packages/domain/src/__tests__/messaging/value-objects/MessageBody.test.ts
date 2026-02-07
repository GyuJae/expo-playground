import { describe, it, expect } from "vitest";
import { MessageBody } from "../../../messaging/value-objects/MessageBody.js";
import { InvalidMessageBodyError } from "../../../shared/DomainError.js";

describe("MessageBody", () => {
  describe("create", () => {
    it("유효한 본문으로 생성한다", () => {
      const body = MessageBody.create("메시지 내용");
      expect(body.value).toBe("메시지 내용");
    });

    it("앞뒤 공백을 제거한다", () => {
      const body = MessageBody.create("  메시지  ");
      expect(body.value).toBe("메시지");
    });

    it("5000자 본문을 허용한다 (경계값)", () => {
      const value = "가".repeat(5000);
      const body = MessageBody.create(value);
      expect(body.value).toBe(value);
    });

    it("5001자 본문에 InvalidMessageBodyError를 던진다", () => {
      const value = "가".repeat(5001);
      expect(() => MessageBody.create(value)).toThrow(InvalidMessageBodyError);
    });

    it("빈 문자열에 InvalidMessageBodyError를 던진다", () => {
      expect(() => MessageBody.create("")).toThrow(InvalidMessageBodyError);
    });

    it("공백만 있는 문자열에 InvalidMessageBodyError를 던진다", () => {
      expect(() => MessageBody.create("   ")).toThrow(InvalidMessageBodyError);
    });
  });

  describe("equals", () => {
    it("같은 값은 동일하다", () => {
      const a = MessageBody.create("메시지");
      const b = MessageBody.create("메시지");
      expect(a.equals(b)).toBe(true);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 복원한다", () => {
      const body = MessageBody.reconstruct("DB메시지");
      expect(body.value).toBe("DB메시지");
    });
  });
});
