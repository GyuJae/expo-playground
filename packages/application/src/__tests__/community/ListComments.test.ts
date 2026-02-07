import { describe, it, expect, vi } from "vitest";
import {
  Comment,
  CommentBody,
  createCommentId,
  createPostId,
  createUserId,
} from "@expo-playground/domain";
import type { CommentRepository } from "../../community/ports/CommentRepository.js";
import { ListComments } from "../../community/use-cases/ListComments.js";

const VALID_POST_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeComment(id: string) {
  return Comment.create({
    id: createCommentId(id),
    postId: createPostId(VALID_POST_ID),
    authorId: createUserId("660e8400-e29b-41d4-a716-446655440000"),
    body: CommentBody.create("댓글"),
    createdAt: new Date(),
  });
}

function makeCommentRepo(comments: Comment[] = []): CommentRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByPostId: vi.fn().mockResolvedValue(comments),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ListComments", () => {
  it("게시글별 댓글 목록을 반환한다", async () => {
    const comments = [
      makeComment("110e8400-e29b-41d4-a716-446655440000"),
      makeComment("220e8400-e29b-41d4-a716-446655440000"),
    ];
    const commentRepo = makeCommentRepo(comments);
    const uc = new ListComments(commentRepo);

    const result = await uc.execute(VALID_POST_ID);
    expect(result).toHaveLength(2);
    expect(commentRepo.findByPostId).toHaveBeenCalledOnce();
  });

  it("댓글이 없으면 빈 배열을 반환한다", async () => {
    const commentRepo = makeCommentRepo([]);
    const uc = new ListComments(commentRepo);

    const result = await uc.execute(VALID_POST_ID);
    expect(result).toHaveLength(0);
  });

  it("유효하지 않은 postId이면 에러를 던진다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new ListComments(commentRepo);

    await expect(uc.execute("bad")).rejects.toThrow();
  });
});
