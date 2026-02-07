import { describe, it, expect } from "vitest";
import {
  createUserId,
  createPostId,
  createCommentId,
  createConversationId,
  createMessageId,
  UUID_REGEX,
} from "../../shared/types.js";
import { InvalidUuidError } from "../../shared/DomainError.js";

describe("UUID_REGEX", () => {
  it("유효한 UUID v4를 매칭한다", () => {
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("대문자 UUID도 매칭한다", () => {
    expect(UUID_REGEX.test("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("유효하지 않은 문자열을 거부한다", () => {
    expect(UUID_REGEX.test("not-a-uuid")).toBe(false);
    expect(UUID_REGEX.test("")).toBe(false);
    expect(UUID_REGEX.test("550e8400-e29b-41d4-a716")).toBe(false);
  });
});

describe("createUserId", () => {
  it("유효한 UUID로 UserId를 생성한다", () => {
    const id = createUserId("550e8400-e29b-41d4-a716-446655440000");
    expect(id).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("유효하지 않은 UUID에 InvalidUuidError를 던진다", () => {
    expect(() => createUserId("invalid")).toThrow(InvalidUuidError);
    expect(() => createUserId("invalid")).toThrow('UserId');
  });

  it("빈 문자열에 InvalidUuidError를 던진다", () => {
    expect(() => createUserId("")).toThrow(InvalidUuidError);
  });
});

describe("createPostId", () => {
  it("유효한 UUID로 PostId를 생성한다", () => {
    const id = createPostId("660e8400-e29b-41d4-a716-446655440000");
    expect(id).toBe("660e8400-e29b-41d4-a716-446655440000");
  });

  it("유효하지 않은 UUID에 InvalidUuidError를 던진다", () => {
    expect(() => createPostId("bad")).toThrow(InvalidUuidError);
    expect(() => createPostId("bad")).toThrow('PostId');
  });
});

describe("createCommentId", () => {
  it("유효한 UUID로 CommentId를 생성한다", () => {
    const id = createCommentId("770e8400-e29b-41d4-a716-446655440000");
    expect(id).toBe("770e8400-e29b-41d4-a716-446655440000");
  });

  it("유효하지 않은 UUID에 InvalidUuidError를 던진다", () => {
    expect(() => createCommentId("bad")).toThrow(InvalidUuidError);
    expect(() => createCommentId("bad")).toThrow("CommentId");
  });
});

describe("createConversationId", () => {
  it("유효한 UUID로 ConversationId를 생성한다", () => {
    const id = createConversationId("880e8400-e29b-41d4-a716-446655440000");
    expect(id).toBe("880e8400-e29b-41d4-a716-446655440000");
  });

  it("유효하지 않은 UUID에 InvalidUuidError를 던진다", () => {
    expect(() => createConversationId("bad")).toThrow(InvalidUuidError);
    expect(() => createConversationId("bad")).toThrow("ConversationId");
  });
});

describe("createMessageId", () => {
  it("유효한 UUID로 MessageId를 생성한다", () => {
    const id = createMessageId("990e8400-e29b-41d4-a716-446655440000");
    expect(id).toBe("990e8400-e29b-41d4-a716-446655440000");
  });

  it("유효하지 않은 UUID에 InvalidUuidError를 던진다", () => {
    expect(() => createMessageId("bad")).toThrow(InvalidUuidError);
    expect(() => createMessageId("bad")).toThrow("MessageId");
  });
});
