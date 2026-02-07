import { describe, it, expect, vi } from "vitest";
import {
  Comment,
  CommentBody,
  createCommentId,
  createPostId,
  createUserId,
  InvalidCommentBodyError,
  AlreadyDeletedCommentError,
} from "@expo-playground/domain";
import type { CommentRepository } from "../../community/ports/CommentRepository.js";
import { UpdateComment } from "../../community/use-cases/UpdateComment.js";
import { CommentNotFoundError, UnauthorizedError } from "../../shared/errors.js";

const COMMENT_ID = "550e8400-e29b-41d4-a716-446655440000";
const AUTHOR_ID = "660e8400-e29b-41d4-a716-446655440000";
const OTHER_USER = "770e8400-e29b-41d4-a716-446655440000";

function makeComment(deleted = false) {
  const comment = Comment.create({
    id: createCommentId(COMMENT_ID),
    postId: createPostId("880e8400-e29b-41d4-a716-446655440000"),
    authorId: createUserId(AUTHOR_ID),
    body: CommentBody.create("원본 댓글"),
    createdAt: new Date("2025-01-01"),
  });
  if (deleted) {
    comment.softDelete(new Date("2025-01-02"));
  }
  return comment;
}

function makeCommentRepo(comment: Comment | null = makeComment()): CommentRepository {
  return {
    findById: vi.fn().mockResolvedValue(comment),
    findByPostId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("UpdateComment", () => {
  it("댓글을 수정하고 저장한다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new UpdateComment(commentRepo);

    const result = await uc.execute({
      commentId: COMMENT_ID,
      requesterId: AUTHOR_ID,
      body: "수정된 댓글",
    });

    expect(result.body.value).toBe("수정된 댓글");
    expect(commentRepo.save).toHaveBeenCalledOnce();
  });

  it("댓글이 없으면 CommentNotFoundError를 던진다", async () => {
    const commentRepo = makeCommentRepo(null);
    const uc = new UpdateComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID, body: "수정" }),
    ).rejects.toThrow(CommentNotFoundError);
  });

  it("작성자가 아니면 UnauthorizedError를 던진다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new UpdateComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: OTHER_USER, body: "수정" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("삭제된 댓글 수정 시 AlreadyDeletedCommentError를 던진다", async () => {
    const commentRepo = makeCommentRepo(makeComment(true));
    const uc = new UpdateComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID, body: "수정" }),
    ).rejects.toThrow(AlreadyDeletedCommentError);
  });

  it("빈 body이면 InvalidCommentBodyError를 던진다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new UpdateComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID, body: "" }),
    ).rejects.toThrow(InvalidCommentBodyError);
  });
});
