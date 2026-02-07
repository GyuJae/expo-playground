import { describe, it, expect } from "vitest";
import { Post } from "../../../community/entities/Post.js";
import { PostContent } from "../../../community/value-objects/PostContent.js";
import { createPostId, createUserId } from "../../../shared/types.js";
import { AlreadyDeletedPostError } from "../../../shared/DomainError.js";

const POST_ID = createPostId("550e8400-e29b-41d4-a716-446655440000");
const AUTHOR_ID = createUserId("660e8400-e29b-41d4-a716-446655440000");
const CREATED_AT = new Date("2025-01-01T00:00:00Z");
const UPDATED_AT = new Date("2025-01-02T00:00:00Z");
const DELETED_AT = new Date("2025-01-03T00:00:00Z");

function createTestPost() {
  return Post.create({
    id: POST_ID,
    authorId: AUTHOR_ID,
    content: PostContent.create("테스트 제목", "테스트 본문"),
    createdAt: CREATED_AT,
  });
}

describe("Post", () => {
  describe("create", () => {
    it("유효한 파라미터로 Post를 생성한다", () => {
      const post = createTestPost();
      expect(post.id).toBe(POST_ID);
      expect(post.authorId).toBe(AUTHOR_ID);
      expect(post.content.title).toBe("테스트 제목");
      expect(post.content.body).toBe("테스트 본문");
      expect(post.createdAt).toBe(CREATED_AT);
    });

    it("새 글의 updatedAt은 createdAt과 같다", () => {
      const post = createTestPost();
      expect(post.updatedAt).toBe(CREATED_AT);
    });

    it("새 글의 deletedAt은 null이다", () => {
      const post = createTestPost();
      expect(post.deletedAt).toBeNull();
      expect(post.isDeleted).toBe(false);
    });
  });

  describe("updateContent", () => {
    it("콘텐츠를 수정하고 updatedAt을 갱신한다", () => {
      const post = createTestPost();
      const newContent = PostContent.create("수정 제목", "수정 본문");
      post.updateContent(newContent, UPDATED_AT);

      expect(post.content.title).toBe("수정 제목");
      expect(post.content.body).toBe("수정 본문");
      expect(post.updatedAt).toBe(UPDATED_AT);
    });

    it("삭제된 글 수정 시 AlreadyDeletedPostError를 던진다", () => {
      const post = createTestPost();
      post.softDelete(DELETED_AT);

      const newContent = PostContent.create("수정 제목", "수정 본문");
      expect(() => post.updateContent(newContent, UPDATED_AT)).toThrow(
        AlreadyDeletedPostError
      );
    });
  });

  describe("softDelete", () => {
    it("소프트 삭제한다", () => {
      const post = createTestPost();
      post.softDelete(DELETED_AT);

      expect(post.deletedAt).toBe(DELETED_AT);
      expect(post.isDeleted).toBe(true);
    });

    it("이미 삭제된 글 재삭제 시 AlreadyDeletedPostError를 던진다", () => {
      const post = createTestPost();
      post.softDelete(DELETED_AT);

      expect(() => post.softDelete(UPDATED_AT)).toThrow(
        AlreadyDeletedPostError
      );
    });
  });

  describe("equals", () => {
    it("같은 ID의 Post는 동일하다", () => {
      const a = createTestPost();
      const b = createTestPost();
      expect(a.equals(b)).toBe(true);
    });

    it("다른 ID의 Post는 다르다", () => {
      const a = createTestPost();
      const b = Post.create({
        id: createPostId("770e8400-e29b-41d4-a716-446655440000"),
        authorId: AUTHOR_ID,
        content: PostContent.create("제목", "본문"),
        createdAt: CREATED_AT,
      });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const post = Post.reconstruct({
        id: POST_ID,
        authorId: AUTHOR_ID,
        content: PostContent.reconstruct("DB제목", "DB본문"),
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
        deletedAt: DELETED_AT,
      });
      expect(post.content.title).toBe("DB제목");
      expect(post.updatedAt).toBe(UPDATED_AT);
      expect(post.deletedAt).toBe(DELETED_AT);
      expect(post.isDeleted).toBe(true);
    });
  });
});
