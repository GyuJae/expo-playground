import { describe, it, expect } from "vitest";
import { PostContent } from "../../../community/value-objects/PostContent.js";
import {
  InvalidPostTitleError,
  InvalidPostBodyError,
} from "../../../shared/DomainError.js";

describe("PostContent", () => {
  describe("create", () => {
    it("유효한 제목과 본문으로 생성한다", () => {
      const content = PostContent.create("제목", "본문 내용");
      expect(content.title).toBe("제목");
      expect(content.body).toBe("본문 내용");
    });

    it("앞뒤 공백을 제거한다", () => {
      const content = PostContent.create("  제목  ", "  본문  ");
      expect(content.title).toBe("제목");
      expect(content.body).toBe("본문");
    });

    it("1자 제목을 허용한다 (경계값)", () => {
      const content = PostContent.create("A", "본문");
      expect(content.title).toBe("A");
    });

    it("100자 제목을 허용한다 (경계값)", () => {
      const title = "가".repeat(100);
      const content = PostContent.create(title, "본문");
      expect(content.title).toBe(title);
    });

    it("101자 제목에 InvalidPostTitleError를 던진다", () => {
      const title = "가".repeat(101);
      expect(() => PostContent.create(title, "본문")).toThrow(
        InvalidPostTitleError
      );
    });

    it("빈 제목에 InvalidPostTitleError를 던진다", () => {
      expect(() => PostContent.create("", "본문")).toThrow(InvalidPostTitleError);
    });

    it("공백만 있는 제목에 InvalidPostTitleError를 던진다", () => {
      expect(() => PostContent.create("   ", "본문")).toThrow(
        InvalidPostTitleError
      );
    });

    it("1자 본문을 허용한다 (경계값)", () => {
      const content = PostContent.create("제목", "A");
      expect(content.body).toBe("A");
    });

    it("10000자 본문을 허용한다 (경계값)", () => {
      const body = "가".repeat(10000);
      const content = PostContent.create("제목", body);
      expect(content.body).toBe(body);
    });

    it("10001자 본문에 InvalidPostBodyError를 던진다", () => {
      const body = "가".repeat(10001);
      expect(() => PostContent.create("제목", body)).toThrow(
        InvalidPostBodyError
      );
    });

    it("빈 본문에 InvalidPostBodyError를 던진다", () => {
      expect(() => PostContent.create("제목", "")).toThrow(InvalidPostBodyError);
    });
  });

  describe("equals", () => {
    it("같은 제목/본문은 동일하다", () => {
      const a = PostContent.create("제목", "본문");
      const b = PostContent.create("제목", "본문");
      expect(a.equals(b)).toBe(true);
    });

    it("다른 제목은 다르다", () => {
      const a = PostContent.create("제목A", "본문");
      const b = PostContent.create("제목B", "본문");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("검증 없이 복원한다", () => {
      const content = PostContent.reconstruct("DB제목", "DB본문");
      expect(content.title).toBe("DB제목");
      expect(content.body).toBe("DB본문");
    });
  });
});
