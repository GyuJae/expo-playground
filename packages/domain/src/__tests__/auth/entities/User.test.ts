import { describe, it, expect } from "vitest";
import { User } from "../../../auth/entities/User.js";
import { createUserId } from "../../../shared/types.js";
import { Email } from "../../../auth/value-objects/Email.js";
import { Nickname } from "../../../auth/value-objects/Nickname.js";
import { AvatarUrl } from "../../../auth/value-objects/AvatarUrl.js";

const VALID_ID = createUserId("550e8400-e29b-41d4-a716-446655440000");
const OTHER_ID = createUserId("660e8400-e29b-41d4-a716-446655440000");
const NOW = new Date("2025-01-01T00:00:00Z");

function createTestUser(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return User.create({
    id: VALID_ID,
    email: Email.create("test@example.com"),
    nickname: Nickname.create("테스터"),
    avatarUrl: AvatarUrl.create(null),
    createdAt: NOW,
    ...overrides,
  });
}

describe("User", () => {
  describe("create", () => {
    it("유효한 파라미터로 User를 생성한다", () => {
      const user = createTestUser();
      expect(user.id).toBe(VALID_ID);
      expect(user.email.value).toBe("test@example.com");
      expect(user.nickname.value).toBe("테스터");
      expect(user.avatarUrl.value).toBeNull();
      expect(user.createdAt).toBe(NOW);
    });
  });

  describe("updateNickname", () => {
    it("닉네임을 변경한다", () => {
      const user = createTestUser();
      const newNickname = Nickname.create("새닉네임");
      user.updateNickname(newNickname);
      expect(user.nickname.value).toBe("새닉네임");
    });
  });

  describe("updateAvatarUrl", () => {
    it("아바타 URL을 변경한다", () => {
      const user = createTestUser();
      const newAvatar = AvatarUrl.create("https://example.com/new.png");
      user.updateAvatarUrl(newAvatar);
      expect(user.avatarUrl.value).toBe("https://example.com/new.png");
    });

    it("아바타 URL을 null로 변경한다", () => {
      const user = createTestUser({
        avatarUrl: AvatarUrl.create("https://example.com/old.png"),
      });
      user.updateAvatarUrl(AvatarUrl.create(null));
      expect(user.avatarUrl.value).toBeNull();
    });
  });

  describe("불변 필드", () => {
    it("email은 읽기전용이다", () => {
      const user = createTestUser();
      expect(user.email.value).toBe("test@example.com");
    });

    it("createdAt은 읽기전용이다", () => {
      const user = createTestUser();
      expect(user.createdAt).toBe(NOW);
    });
  });

  describe("equals", () => {
    it("같은 ID의 User는 동일하다", () => {
      const a = createTestUser();
      const b = createTestUser({ nickname: Nickname.create("다른닉네임") });
      expect(a.equals(b)).toBe(true);
    });

    it("다른 ID의 User는 다르다", () => {
      const a = createTestUser();
      const b = createTestUser({ id: OTHER_ID });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const user = User.reconstruct({
        id: VALID_ID,
        email: Email.reconstruct("db@example.com"),
        nickname: Nickname.reconstruct("DB닉네임"),
        avatarUrl: AvatarUrl.reconstruct("https://db.com/avatar.png"),
        createdAt: NOW,
      });
      expect(user.email.value).toBe("db@example.com");
      expect(user.nickname.value).toBe("DB닉네임");
    });
  });
});
