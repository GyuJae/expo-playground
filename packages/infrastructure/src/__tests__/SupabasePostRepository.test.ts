import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Post,
  PostContent,
  createPostId,
  createUserId,
  type PostId,
} from "@expo-playground/domain";
import { SupabasePostRepository } from "../supabase/SupabasePostRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const repo = new SupabasePostRepository(admin);

beforeEach(async () => {
  await cleanDatabase(admin);
});

/** 테스트용 Post 엔티티 생성 */
function createTestPost(authorId: string, overrides?: { title?: string; body?: string }) {
  const postId = createPostId(crypto.randomUUID()) as PostId;
  return Post.create({
    id: postId,
    authorId: createUserId(authorId),
    content: PostContent.create(
      overrides?.title ?? "테스트 제목",
      overrides?.body ?? "테스트 본문",
    ),
    createdAt: new Date(),
  });
}

describe("SupabasePostRepository", () => {
  it("새 게시글을 생성한다", async () => {
    const testUser = await createTestAuthUser(admin);
    const post = createTestPost(testUser.id);

    await repo.save(post);

    const found = await repo.findById(post.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(post.id);
    expect(found!.authorId).toBe(testUser.id);
    expect(found!.content.title).toBe("테스트 제목");
    expect(found!.content.body).toBe("테스트 본문");
  });

  it("게시글을 수정한다", async () => {
    const testUser = await createTestAuthUser(admin);
    const post = createTestPost(testUser.id);
    await repo.save(post);

    // 콘텐츠 수정
    post.updateContent(PostContent.create("수정된 제목", "수정된 본문"), new Date());
    await repo.save(post);

    const updated = await repo.findById(post.id);
    expect(updated!.content.title).toBe("수정된 제목");
    expect(updated!.content.body).toBe("수정된 본문");
  });

  it("소프트 삭제 후 조회 시 null을 반환한다", async () => {
    const testUser = await createTestAuthUser(admin);
    const post = createTestPost(testUser.id);
    await repo.save(post);

    // 소프트 삭제
    post.softDelete(new Date());
    await repo.save(post);

    const found = await repo.findById(post.id);
    expect(found).toBeNull();
  });

  it("전체 목록 조회 시 삭제된 글 제외, 최신순 정렬", async () => {
    const testUser = await createTestAuthUser(admin);

    // 3개 게시글 생성 (시간차)
    const post1 = createTestPost(testUser.id, { title: "첫 번째" });
    await repo.save(post1);
    // 약간의 시간차를 위해 별도 생성
    const post2 = createTestPost(testUser.id, { title: "두 번째" });
    await repo.save(post2);
    const post3 = createTestPost(testUser.id, { title: "세 번째" });
    await repo.save(post3);

    // 두 번째 게시글 소프트 삭제
    post2.softDelete(new Date());
    await repo.save(post2);

    const list = await repo.findAll();

    expect(list).toHaveLength(2);
    // 최신순: post3이 먼저
    expect(list[0]!.content.title).toBe("세 번째");
    expect(list[1]!.content.title).toBe("첫 번째");
  });

  it("존재하지 않는 게시글 조회 시 null을 반환한다", async () => {
    const fakeId = createPostId("00000000-0000-0000-0000-000000000000");
    const found = await repo.findById(fakeId);

    expect(found).toBeNull();
  });
});
