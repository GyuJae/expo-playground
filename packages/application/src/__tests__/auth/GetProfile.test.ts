import { describe, it, expect, vi } from "vitest";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  createUserId,
  InvalidUuidError,
} from "@expo-playground/domain";
import type { UserRepository } from "../../auth/ports/UserRepository.js";
import { GetProfile } from "../../auth/use-cases/GetProfile.js";
import { UserNotFoundError } from "../../shared/errors.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makeUserRepo(user: User | null = null): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(user),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeUser(): User {
  return User.reconstruct({
    id: createUserId(VALID_UUID),
    email: Email.reconstruct("test@example.com"),
    nickname: Nickname.reconstruct("test"),
    avatarUrl: AvatarUrl.reconstruct(null),
    createdAt: new Date("2024-01-01"),
  });
}

describe("GetProfile", () => {
  it("존재하는 사용자를 반환한다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new GetProfile(userRepo);

    const result = await uc.execute(VALID_UUID);

    expect(result).toBe(user);
  });

  it("사용자가 없으면 UserNotFoundError를 던진다", async () => {
    const userRepo = makeUserRepo(null);
    const uc = new GetProfile(userRepo);

    await expect(uc.execute(VALID_UUID)).rejects.toThrow(UserNotFoundError);
  });

  it("유효하지 않은 UUID이면 InvalidUuidError를 던진다", async () => {
    const userRepo = makeUserRepo(null);
    const uc = new GetProfile(userRepo);

    await expect(uc.execute("not-a-uuid")).rejects.toThrow(InvalidUuidError);
  });
});
