import { describe, it, expect } from "vitest";
import { Email } from "../../../auth/value-objects/Email.js";
import { InvalidEmailError } from "../../../shared/DomainError.js";

describe("Email", () => {
  describe("create", () => {
    it("유효한 이메일을 생성한다", () => {
      const email = Email.create("user@example.com");
      expect(email.value).toBe("user@example.com");
    });

    it("대문자 이메일을 소문자로 정규화한다", () => {
      const email = Email.create("USER@EXAMPLE.COM");
      expect(email.value).toBe("user@example.com");
    });

    it("앞뒤 공백을 제거한다", () => {
      const email = Email.create("  user@example.com  ");
      expect(email.value).toBe("user@example.com");
    });

    it("빈 문자열에 InvalidEmailError를 던진다", () => {
      expect(() => Email.create("")).toThrow(InvalidEmailError);
    });

    it("@ 없는 문자열에 InvalidEmailError를 던진다", () => {
      expect(() => Email.create("invalid")).toThrow(InvalidEmailError);
    });

    it("도메인 없는 이메일에 InvalidEmailError를 던진다", () => {
      expect(() => Email.create("user@")).toThrow(InvalidEmailError);
    });

    it("공백만 있는 문자열에 InvalidEmailError를 던진다", () => {
      expect(() => Email.create("   ")).toThrow(InvalidEmailError);
    });
  });

  describe("equals", () => {
    it("같은 이메일 VO는 동일하다", () => {
      const a = Email.create("test@test.com");
      const b = Email.create("TEST@TEST.COM");
      expect(a.equals(b)).toBe(true);
    });

    it("다른 이메일 VO는 다르다", () => {
      const a = Email.create("a@test.com");
      const b = Email.create("b@test.com");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 Email을 복원한다", () => {
      const email = Email.reconstruct("stored@db.com");
      expect(email.value).toBe("stored@db.com");
    });
  });
});
