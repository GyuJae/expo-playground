import { describe, it, expect, vi } from "vitest";
import {
  Comment,
  CommentBody,
  createCommentId,
  createPostId,
  createUserId,
  AlreadyDeletedCommentError,
} from "@expo-playground/domain";
import type { CommentRepository } from "../../community/ports/CommentRepository.js";
import { DeleteComment } from "../../community/use-cases/DeleteComment.js";
import { CommentNotFoundError, UnauthorizedError } from "../../shared/errors.js";

const COMMENT_ID = "550e8400-e29b-41d4-a716-446655440000";
const AUTHOR_ID = "660e8400-e29b-41d4-a716-446655440000";
const OTHER_USER = "770e8400-e29b-41d4-a716-446655440000";

function makeComment(deleted = false) {
  const comment = Comment.create({
    id: createCommentId(COMMENT_ID),
    postId: createPostId("880e8400-e29b-41d4-a716-446655440000"),
    authorId: createUserId(AUTHOR_ID),
    body: CommentBody.create("댓글"),
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

describe("DeleteComment", () => {
  it("댓글을 소프트 삭제한다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new DeleteComment(commentRepo);

    await uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID });

    expect(commentRepo.save).toHaveBeenCalledOnce();
    const savedComment = (commentRepo.save as ReturnType<typeof vi.fn>).mock.calls[0]![0] as Comment;
    expect(savedComment.isDeleted).toBe(true);
  });

  it("댓글이 없으면 CommentNotFoundError를 던진다", async () => {
    const commentRepo = makeCommentRepo(null);
    const uc = new DeleteComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID }),
    ).rejects.toThrow(CommentNotFoundError);
  });

  it("작성자가 아니면 UnauthorizedError를 던진다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new DeleteComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: OTHER_USER }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("이미 삭제된 댓글이면 AlreadyDeletedCommentError를 던진다", async () => {
    const commentRepo = makeCommentRepo(makeComment(true));
    const uc = new DeleteComment(commentRepo);

    await expect(
      uc.execute({ commentId: COMMENT_ID, requesterId: AUTHOR_ID }),
    ).rejects.toThrow(AlreadyDeletedCommentError);
  });

  it("유효하지 않은 commentId이면 에러를 던진다", async () => {
    const commentRepo = makeCommentRepo();
    const uc = new DeleteComment(commentRepo);

    await expect(
      uc.execute({ commentId: "bad", requesterId: AUTHOR_ID }),
    ).rejects.toThrow();
  });
});
