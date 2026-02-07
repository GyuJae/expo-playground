import { describe, it, expect } from "vitest";
import { Comment } from "../../../community/entities/Comment.js";
import { CommentBody } from "../../../community/value-objects/CommentBody.js";
import {
  createCommentId,
  createPostId,
  createUserId,
} from "../../../shared/types.js";
import { AlreadyDeletedCommentError } from "../../../shared/DomainError.js";

const COMMENT_ID = createCommentId("550e8400-e29b-41d4-a716-446655440000");
const POST_ID = createPostId("660e8400-e29b-41d4-a716-446655440000");
const AUTHOR_ID = createUserId("770e8400-e29b-41d4-a716-446655440000");
const CREATED_AT = new Date("2025-01-01T00:00:00Z");
const UPDATED_AT = new Date("2025-01-02T00:00:00Z");
const DELETED_AT = new Date("2025-01-03T00:00:00Z");

function createTestComment() {
  return Comment.create({
    id: COMMENT_ID,
    postId: POST_ID,
    authorId: AUTHOR_ID,
    body: CommentBody.create("테스트 댓글"),
    createdAt: CREATED_AT,
  });
}

describe("Comment", () => {
  describe("create", () => {
    it("유효한 파라미터로 Comment를 생성한다", () => {
      const comment = createTestComment();
      expect(comment.id).toBe(COMMENT_ID);
      expect(comment.postId).toBe(POST_ID);
      expect(comment.authorId).toBe(AUTHOR_ID);
      expect(comment.body.value).toBe("테스트 댓글");
      expect(comment.createdAt).toBe(CREATED_AT);
    });

    it("새 댓글의 updatedAt은 createdAt과 같다", () => {
      const comment = createTestComment();
      expect(comment.updatedAt).toBe(CREATED_AT);
    });

    it("새 댓글의 deletedAt은 null이다", () => {
      const comment = createTestComment();
      expect(comment.deletedAt).toBeNull();
      expect(comment.isDeleted).toBe(false);
    });
  });

  describe("updateBody", () => {
    it("본문을 수정하고 updatedAt을 갱신한다", () => {
      const comment = createTestComment();
      const newBody = CommentBody.create("수정된 댓글");
      comment.updateBody(newBody, UPDATED_AT);

      expect(comment.body.value).toBe("수정된 댓글");
      expect(comment.updatedAt).toBe(UPDATED_AT);
    });

    it("삭제된 댓글 수정 시 AlreadyDeletedCommentError를 던진다", () => {
      const comment = createTestComment();
      comment.softDelete(DELETED_AT);

      const newBody = CommentBody.create("수정 시도");
      expect(() => comment.updateBody(newBody, UPDATED_AT)).toThrow(
        AlreadyDeletedCommentError,
      );
    });
  });

  describe("softDelete", () => {
    it("소프트 삭제한다", () => {
      const comment = createTestComment();
      comment.softDelete(DELETED_AT);

      expect(comment.deletedAt).toBe(DELETED_AT);
      expect(comment.isDeleted).toBe(true);
    });

    it("이미 삭제된 댓글 재삭제 시 AlreadyDeletedCommentError를 던진다", () => {
      const comment = createTestComment();
      comment.softDelete(DELETED_AT);

      expect(() => comment.softDelete(UPDATED_AT)).toThrow(
        AlreadyDeletedCommentError,
      );
    });
  });

  describe("equals", () => {
    it("같은 ID의 Comment는 동일하다", () => {
      const a = createTestComment();
      const b = createTestComment();
      expect(a.equals(b)).toBe(true);
    });

    it("다른 ID의 Comment는 다르다", () => {
      const a = createTestComment();
      const b = Comment.create({
        id: createCommentId("880e8400-e29b-41d4-a716-446655440000"),
        postId: POST_ID,
        authorId: AUTHOR_ID,
        body: CommentBody.create("다른 댓글"),
        createdAt: CREATED_AT,
      });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const comment = Comment.reconstruct({
        id: COMMENT_ID,
        postId: POST_ID,
        authorId: AUTHOR_ID,
        body: CommentBody.reconstruct("DB댓글"),
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
        deletedAt: DELETED_AT,
      });
      expect(comment.body.value).toBe("DB댓글");
      expect(comment.updatedAt).toBe(UPDATED_AT);
      expect(comment.deletedAt).toBe(DELETED_AT);
      expect(comment.isDeleted).toBe(true);
    });

    it("deletedAt이 null인 상태로 복원한다", () => {
      const comment = Comment.reconstruct({
        id: COMMENT_ID,
        postId: POST_ID,
        authorId: AUTHOR_ID,
        body: CommentBody.reconstruct("DB댓글"),
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
        deletedAt: null,
      });
      expect(comment.isDeleted).toBe(false);
    });
  });
});
