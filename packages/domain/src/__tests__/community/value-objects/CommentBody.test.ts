import { describe, it, expect } from "vitest";
import { CommentBody } from "../../../community/value-objects/CommentBody.js";
import { InvalidCommentBodyError } from "../../../shared/DomainError.js";

describe("CommentBody", () => {
  describe("create", () => {
    it("유효한 본문으로 생성한다", () => {
      const body = CommentBody.create("댓글 내용");
      expect(body.value).toBe("댓글 내용");
    });

    it("앞뒤 공백을 제거한다", () => {
      const body = CommentBody.create("  댓글  ");
      expect(body.value).toBe("댓글");
    });

    it("1자 본문을 허용한다 (경계값)", () => {
      const body = CommentBody.create("A");
      expect(body.value).toBe("A");
    });

    it("5000자 본문을 허용한다 (경계값)", () => {
      const value = "가".repeat(5000);
      const body = CommentBody.create(value);
      expect(body.value).toBe(value);
    });

    it("5001자 본문에 InvalidCommentBodyError를 던진다", () => {
      const value = "가".repeat(5001);
      expect(() => CommentBody.create(value)).toThrow(InvalidCommentBodyError);
    });

    it("빈 문자열에 InvalidCommentBodyError를 던진다", () => {
      expect(() => CommentBody.create("")).toThrow(InvalidCommentBodyError);
    });

    it("공백만 있는 문자열에 InvalidCommentBodyError를 던진다", () => {
      expect(() => CommentBody.create("   ")).toThrow(InvalidCommentBodyError);
    });
  });

  describe("equals", () => {
    it("같은 값은 동일하다", () => {
      const a = CommentBody.create("댓글");
      const b = CommentBody.create("댓글");
      expect(a.equals(b)).toBe(true);
    });

    it("다른 값은 다르다", () => {
      const a = CommentBody.create("댓글A");
      const b = CommentBody.create("댓글B");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 복원한다", () => {
      const body = CommentBody.reconstruct("DB댓글");
      expect(body.value).toBe("DB댓글");
    });
  });
});
