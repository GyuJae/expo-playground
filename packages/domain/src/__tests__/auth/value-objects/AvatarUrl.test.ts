import { describe, it, expect } from "vitest";
import { AvatarUrl } from "../../../auth/value-objects/AvatarUrl.js";
import { InvalidAvatarUrlError } from "../../../shared/DomainError.js";

describe("AvatarUrl", () => {
  describe("create", () => {
    it("유효한 https URL을 허용한다", () => {
      const url = AvatarUrl.create("https://example.com/avatar.png");
      expect(url.value).toBe("https://example.com/avatar.png");
    });

    it("유효한 http URL을 허용한다", () => {
      const url = AvatarUrl.create("http://example.com/avatar.png");
      expect(url.value).toBe("http://example.com/avatar.png");
    });

    it("null을 허용한다", () => {
      const url = AvatarUrl.create(null);
      expect(url.value).toBeNull();
    });

    it("빈 문자열을 null로 변환한다", () => {
      const url = AvatarUrl.create("");
      expect(url.value).toBeNull();
    });

    it("공백만 있는 문자열을 null로 변환한다", () => {
      const url = AvatarUrl.create("   ");
      expect(url.value).toBeNull();
    });

    it("앞뒤 공백을 제거한다", () => {
      const url = AvatarUrl.create("  https://example.com/a.png  ");
      expect(url.value).toBe("https://example.com/a.png");
    });

    it("http(s)가 아닌 프로토콜에 InvalidAvatarUrlError를 던진다", () => {
      expect(() => AvatarUrl.create("ftp://example.com/a.png")).toThrow(
        InvalidAvatarUrlError
      );
    });

    it("프로토콜 없는 URL에 InvalidAvatarUrlError를 던진다", () => {
      expect(() => AvatarUrl.create("example.com/a.png")).toThrow(
        InvalidAvatarUrlError
      );
    });

    it("2048자 초과 URL에 InvalidAvatarUrlError를 던진다", () => {
      const longUrl = "https://example.com/" + "a".repeat(2030);
      expect(() => AvatarUrl.create(longUrl)).toThrow(InvalidAvatarUrlError);
    });

    it("2048자 이하 URL을 허용한다 (경계값)", () => {
      const url = "https://example.com/" + "a".repeat(2028);
      expect(url.length).toBe(2048);
      const avatar = AvatarUrl.create(url);
      expect(avatar.value).toBe(url);
    });
  });

  describe("equals", () => {
    it("같은 URL VO는 동일하다", () => {
      const a = AvatarUrl.create("https://example.com/a.png");
      const b = AvatarUrl.create("https://example.com/a.png");
      expect(a.equals(b)).toBe(true);
    });

    it("null VO끼리는 동일하다", () => {
      const a = AvatarUrl.create(null);
      const b = AvatarUrl.create("");
      expect(a.equals(b)).toBe(true);
    });

    it("다른 URL VO는 다르다", () => {
      const a = AvatarUrl.create("https://a.com/1.png");
      const b = AvatarUrl.create("https://b.com/2.png");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 복원한다", () => {
      const url = AvatarUrl.reconstruct("https://stored.com/a.png");
      expect(url.value).toBe("https://stored.com/a.png");
    });

    it("null로 복원한다", () => {
      const url = AvatarUrl.reconstruct(null);
      expect(url.value).toBeNull();
    });
  });
});
