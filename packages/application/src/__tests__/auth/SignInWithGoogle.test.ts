import { describe, it, expect, vi } from "vitest";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  createUserId,
} from "@expo-playground/domain";
import type { AuthProvider, AuthResult } from "../../auth/ports/AuthProvider.js";
import type { UserRepository } from "../../auth/ports/UserRepository.js";
import { SignInWithGoogle } from "../../auth/use-cases/SignInWithGoogle.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makeAuthProvider(result: AuthResult): AuthProvider {
  return { signInWithGoogle: vi.fn().mockResolvedValue(result) };
}

function makeUserRepo(user: User | null = null): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(user),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeExistingUser(): User {
  return User.reconstruct({
    id: createUserId(VALID_UUID),
    email: Email.reconstruct("test@example.com"),
    nickname: Nickname.reconstruct("test"),
    avatarUrl: AvatarUrl.reconstruct(null),
    createdAt: new Date("2024-01-01"),
  });
}

describe("SignInWithGoogle", () => {
  it("기존 사용자가 있으면 그대로 반환한다", async () => {
    const existing = makeExistingUser();
    const authProvider = makeAuthProvider({
      userId: createUserId(VALID_UUID),
      email: "test@example.com",
    });
    const userRepo = makeUserRepo(existing);
    const uc = new SignInWithGoogle(authProvider, userRepo);

    const result = await uc.execute("id-token");

    expect(result).toBe(existing);
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it("기존 사용자가 없으면 신규 생성하고 저장한다", async () => {
    const authProvider = makeAuthProvider({
      userId: createUserId(VALID_UUID),
      email: "newuser@example.com",
    });
    const userRepo = makeUserRepo(null);
    const uc = new SignInWithGoogle(authProvider, userRepo);

    const result = await uc.execute("id-token");

    expect(result.email.value).toBe("newuser@example.com");
    expect(result.nickname.value).toBe("newuser");
    expect(userRepo.save).toHaveBeenCalledOnce();
  });

  it("이메일 로컬 파트를 닉네임으로 사용한다", async () => {
    const authProvider = makeAuthProvider({
      userId: createUserId(VALID_UUID),
      email: "hello.world@domain.com",
    });
    const userRepo = makeUserRepo(null);
    const uc = new SignInWithGoogle(authProvider, userRepo);

    const result = await uc.execute("id-token");

    expect(result.nickname.value).toBe("hello.world");
  });
});
