import { describe, it, expect } from "vitest";
import {
  ApplicationError,
  UserNotFoundError,
  PostNotFoundError,
} from "../../shared/errors.js";

describe("ApplicationError", () => {
  it("name이 클래스 이름과 같다", () => {
    const error = new ApplicationError("테스트");
    expect(error.name).toBe("ApplicationError");
  });

  it("Error를 상속한다", () => {
    const error = new ApplicationError("테스트");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("UserNotFoundError", () => {
  it("ApplicationError를 상속한다", () => {
    const error = new UserNotFoundError("user-123");
    expect(error).toBeInstanceOf(ApplicationError);
  });

  it("userId가 포함된 메시지를 가진다", () => {
    const error = new UserNotFoundError("user-123");
    expect(error.message).toContain("user-123");
  });
});

describe("PostNotFoundError", () => {
  it("ApplicationError를 상속한다", () => {
    const error = new PostNotFoundError("post-456");
    expect(error).toBeInstanceOf(ApplicationError);
  });

  it("postId가 포함된 메시지를 가진다", () => {
    const error = new PostNotFoundError("post-456");
    expect(error.message).toContain("post-456");
  });
});
