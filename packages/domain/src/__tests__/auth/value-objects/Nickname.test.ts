import { describe, it, expect } from "vitest";
import { Nickname } from "../../../auth/value-objects/Nickname.js";
import { InvalidNicknameError } from "../../../shared/DomainError.js";

describe("Nickname", () => {
  describe("create", () => {
    it("유효한 닉네임을 생성한다", () => {
      const nickname = Nickname.create("홍길동");
      expect(nickname.value).toBe("홍길동");
    });

    it("앞뒤 공백을 제거한다", () => {
      const nickname = Nickname.create("  홍길동  ");
      expect(nickname.value).toBe("홍길동");
    });

    it("1자 닉네임을 허용한다 (경계값)", () => {
      const nickname = Nickname.create("A");
      expect(nickname.value).toBe("A");
    });

    it("30자 닉네임을 허용한다 (경계값)", () => {
      const name = "A".repeat(30);
      const nickname = Nickname.create(name);
      expect(nickname.value).toBe(name);
    });

    it("빈 문자열에 InvalidNicknameError를 던진다", () => {
      expect(() => Nickname.create("")).toThrow(InvalidNicknameError);
    });

    it("공백만 있는 문자열에 InvalidNicknameError를 던진다", () => {
      expect(() => Nickname.create("   ")).toThrow(InvalidNicknameError);
    });

    it("31자 닉네임에 InvalidNicknameError를 던진다 (경계값)", () => {
      const name = "A".repeat(31);
      expect(() => Nickname.create(name)).toThrow(InvalidNicknameError);
    });
  });

  describe("equals", () => {
    it("같은 닉네임 VO는 동일하다", () => {
      const a = Nickname.create("test");
      const b = Nickname.create("test");
      expect(a.equals(b)).toBe(true);
    });

    it("다른 닉네임 VO는 다르다", () => {
      const a = Nickname.create("aaa");
      const b = Nickname.create("bbb");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 복원한다", () => {
      const nickname = Nickname.reconstruct("stored");
      expect(nickname.value).toBe("stored");
    });
  });
});
