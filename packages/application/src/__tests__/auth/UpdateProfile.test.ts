import { describe, it, expect, vi } from "vitest";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  createUserId,
  InvalidUuidError,
  InvalidNicknameError,
  InvalidAvatarUrlError,
} from "@expo-playground/domain";
import type { UserRepository } from "../../auth/ports/UserRepository.js";
import { UpdateProfile } from "../../auth/use-cases/UpdateProfile.js";
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
    nickname: Nickname.reconstruct("original"),
    avatarUrl: AvatarUrl.reconstruct(null),
    createdAt: new Date("2024-01-01"),
  });
}

describe("UpdateProfile", () => {
  it("닉네임을 변경한다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    const result = await uc.execute({
      userId: VALID_UUID,
      nickname: "새닉네임",
    });

    expect(result.nickname.value).toBe("새닉네임");
    expect(userRepo.save).toHaveBeenCalledOnce();
  });

  it("아바타 URL을 변경한다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    const result = await uc.execute({
      userId: VALID_UUID,
      avatarUrl: "https://example.com/avatar.png",
    });

    expect(result.avatarUrl.value).toBe("https://example.com/avatar.png");
    expect(userRepo.save).toHaveBeenCalledOnce();
  });

  it("닉네임과 아바타를 동시에 변경한다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    const result = await uc.execute({
      userId: VALID_UUID,
      nickname: "새닉네임",
      avatarUrl: "https://example.com/new.png",
    });

    expect(result.nickname.value).toBe("새닉네임");
    expect(result.avatarUrl.value).toBe("https://example.com/new.png");
  });

  it("아무 필드도 없으면 변경 없이 저장한다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    const result = await uc.execute({ userId: VALID_UUID });

    expect(result.nickname.value).toBe("original");
    expect(userRepo.save).toHaveBeenCalledOnce();
  });

  it("아바타를 null로 설정할 수 있다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    const result = await uc.execute({
      userId: VALID_UUID,
      avatarUrl: null,
    });

    expect(result.avatarUrl.value).toBeNull();
  });

  it("사용자가 없으면 UserNotFoundError를 던진다", async () => {
    const userRepo = makeUserRepo(null);
    const uc = new UpdateProfile(userRepo);

    await expect(
      uc.execute({ userId: VALID_UUID, nickname: "test" }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it("유효하지 않은 UUID이면 InvalidUuidError를 던진다", async () => {
    const userRepo = makeUserRepo(null);
    const uc = new UpdateProfile(userRepo);

    await expect(
      uc.execute({ userId: "bad-uuid", nickname: "test" }),
    ).rejects.toThrow(InvalidUuidError);
  });

  it("유효하지 않은 닉네임이면 InvalidNicknameError를 던진다", async () => {
    const user = makeUser();
    const userRepo = makeUserRepo(user);
    const uc = new UpdateProfile(userRepo);

    await expect(
      uc.execute({ userId: VALID_UUID, nickname: "" }),
    ).rejects.toThrow(InvalidNicknameError);
  });
});
