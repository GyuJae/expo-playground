import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import {
  User,
  Email,
  Nickname,
  AvatarUrl,
  createUserId,
} from "@expo-playground/domain";
import { SupabaseUserRepository } from "../supabase/SupabaseUserRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const repo = new SupabaseUserRepository(admin);

beforeEach(async () => {
  await cleanDatabase(admin);
});

describe("SupabaseUserRepository", () => {
  it("존재하는 사용자를 조회한다", async () => {
    const testUser = await createTestAuthUser(admin, {
      nickname: "ExistUser",
    });

    const user = await repo.findById(createUserId(testUser.id));

    expect(user).not.toBeNull();
    expect(user!.id).toBe(testUser.id);
    expect(user!.email.value).toBe(testUser.email);
    expect(user!.nickname.value).toBe("ExistUser");
  });

  it("존재하지 않는 사용자 조회 시 null을 반환한다", async () => {
    const fakeId = createUserId("00000000-0000-0000-0000-000000000000");
    const user = await repo.findById(fakeId);

    expect(user).toBeNull();
  });

  it("새 사용자를 저장한다 (upsert)", async () => {
    const testUser = await createTestAuthUser(admin, {
      nickname: "OriginalNick",
    });

    // 트리거가 생성한 프로필을 upsert로 덮어쓴다
    const userId = createUserId(testUser.id);
    const user = User.reconstruct({
      id: userId,
      email: Email.reconstruct(testUser.email),
      nickname: Nickname.reconstruct("UpdatedNick"),
      avatarUrl: AvatarUrl.reconstruct("https://example.com/avatar.png"),
      createdAt: new Date(),
    });

    await repo.save(user);

    const found = await repo.findById(userId);
    expect(found).not.toBeNull();
    expect(found!.nickname.value).toBe("UpdatedNick");
    expect(found!.avatarUrl.value).toBe("https://example.com/avatar.png");
  });

  it("사용자 정보를 수정한다 (닉네임/아바타 변경)", async () => {
    const testUser = await createTestAuthUser(admin, {
      nickname: "BeforeName",
    });
    const userId = createUserId(testUser.id);

    // 기존 프로필 조회
    const existing = await repo.findById(userId);
    expect(existing).not.toBeNull();

    // 닉네임과 아바타 변경
    existing!.updateNickname(Nickname.create("AfterName"));
    existing!.updateAvatarUrl(AvatarUrl.create("https://example.com/new.png"));
    await repo.save(existing!);

    // 변경 확인
    const updated = await repo.findById(userId);
    expect(updated!.nickname.value).toBe("AfterName");
    expect(updated!.avatarUrl.value).toBe("https://example.com/new.png");
  });
});
