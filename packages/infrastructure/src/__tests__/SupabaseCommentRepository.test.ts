import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import {
  Comment,
  CommentBody,
  Post,
  PostContent,
  createCommentId,
  createPostId,
  createUserId,
  type CommentId,
  type PostId,
} from "@expo-playground/domain";
import { SupabaseCommentRepository } from "../supabase/SupabaseCommentRepository.js";
import { SupabasePostRepository } from "../supabase/SupabasePostRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";

const admin = createAdminClient();
const commentRepo = new SupabaseCommentRepository(admin);
const postRepo = new SupabasePostRepository(admin);

beforeEach(async () => {
  await cleanDatabase(admin);
});

/** 테스트용 Post 생성 + 저장 */
async function createAndSavePost(authorId: string): Promise<Post> {
  const post = Post.create({
    id: createPostId(crypto.randomUUID()) as PostId,
    authorId: createUserId(authorId),
    content: PostContent.create("테스트 게시글", "본문"),
    createdAt: new Date(),
  });
  await postRepo.save(post);
  return post;
}

/** 테스트용 Comment 생성 */
function createTestComment(postId: PostId, authorId: string, body = "테스트 댓글") {
  return Comment.create({
    id: createCommentId(crypto.randomUUID()) as CommentId,
    postId,
    authorId: createUserId(authorId),
    body: CommentBody.create(body),
    createdAt: new Date(),
  });
}

describe("SupabaseCommentRepository", () => {
  it("새 댓글을 생성하고 조회한다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);
    const comment = createTestComment(post.id, user.id);

    await commentRepo.save(comment);

    const found = await commentRepo.findById(comment.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(comment.id);
    expect(found!.body.value).toBe("테스트 댓글");
  });

  it("게시글별 댓글 목록을 오래된 순으로 조회한다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);

    const c1 = createTestComment(post.id, user.id, "첫 번째");
    const c2 = createTestComment(post.id, user.id, "두 번째");
    await commentRepo.save(c1);
    await commentRepo.save(c2);

    const list = await commentRepo.findByPostId(post.id);
    expect(list).toHaveLength(2);
    expect(list[0]!.body.value).toBe("첫 번째");
    expect(list[1]!.body.value).toBe("두 번째");
  });

  it("소프트 삭제 후 findById에서 null을 반환한다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);
    const comment = createTestComment(post.id, user.id);
    await commentRepo.save(comment);

    comment.softDelete(new Date());
    await commentRepo.save(comment);

    const found = await commentRepo.findById(comment.id);
    expect(found).toBeNull();
  });

  it("소프트 삭제된 댓글은 목록에서 제외된다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);

    const c1 = createTestComment(post.id, user.id, "유지");
    const c2 = createTestComment(post.id, user.id, "삭제");
    await commentRepo.save(c1);
    await commentRepo.save(c2);

    c2.softDelete(new Date());
    await commentRepo.save(c2);

    const list = await commentRepo.findByPostId(post.id);
    expect(list).toHaveLength(1);
    expect(list[0]!.body.value).toBe("유지");
  });

  it("댓글 본문을 수정한다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);
    const comment = createTestComment(post.id, user.id);
    await commentRepo.save(comment);

    comment.updateBody(CommentBody.create("수정된 댓글"), new Date());
    await commentRepo.save(comment);

    const found = await commentRepo.findById(comment.id);
    expect(found!.body.value).toBe("수정된 댓글");
  });

  it("존재하지 않는 댓글 조회 시 null을 반환한다", async () => {
    const fakeId = createCommentId("00000000-0000-0000-0000-000000000000");
    const found = await commentRepo.findById(fakeId);
    expect(found).toBeNull();
  });

  it("수정 시 updated_at이 트리거로 갱신된다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);
    const comment = createTestComment(post.id, user.id);
    await commentRepo.save(comment);

    const before = await commentRepo.findById(comment.id);
    const beforeUpdatedAt = before!.updatedAt;

    // 약간의 지연 후 수정
    await new Promise((r) => setTimeout(r, 50));
    comment.updateBody(CommentBody.create("수정"), new Date());
    await commentRepo.save(comment);

    const after = await commentRepo.findById(comment.id);
    expect(after!.updatedAt.getTime()).toBeGreaterThan(beforeUpdatedAt.getTime());
  });
});
