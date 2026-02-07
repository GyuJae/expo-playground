import { describe, it, expect, vi } from "vitest";
import {
  Post,
  PostContent,
  Comment,
  CommentBody,
  createPostId,
  createUserId,
  createCommentId,
  InvalidUuidError,
  InvalidCommentBodyError,
} from "@expo-playground/domain";
import type { PostRepository } from "../../community/ports/PostRepository.js";
import type { CommentRepository } from "../../community/ports/CommentRepository.js";
import { CreateComment } from "../../community/use-cases/CreateComment.js";
import { PostNotFoundError } from "../../shared/errors.js";

const VALID_POST_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_USER_ID = "660e8400-e29b-41d4-a716-446655440000";

function makePost() {
  return Post.create({
    id: createPostId(VALID_POST_ID),
    authorId: createUserId(VALID_USER_ID),
    content: PostContent.create("제목", "본문"),
    createdAt: new Date(),
  });
}

function makePostRepo(post: Post | null = makePost()): PostRepository {
  return {
    findById: vi.fn().mockResolvedValue(post),
    findAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeCommentRepo(): CommentRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByPostId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("CreateComment", () => {
  it("댓글을 생성하고 저장한다", async () => {
    const postRepo = makePostRepo();
    const commentRepo = makeCommentRepo();
    const uc = new CreateComment(postRepo, commentRepo);

    const result = await uc.execute({
      postId: VALID_POST_ID,
      authorId: VALID_USER_ID,
      body: "테스트 댓글",
    });

    expect(result.body.value).toBe("테스트 댓글");
    expect(result.postId).toBe(VALID_POST_ID);
    expect(result.authorId).toBe(VALID_USER_ID);
    expect(commentRepo.save).toHaveBeenCalledOnce();
  });

  it("게시글이 없으면 PostNotFoundError를 던진다", async () => {
    const postRepo = makePostRepo(null);
    const commentRepo = makeCommentRepo();
    const uc = new CreateComment(postRepo, commentRepo);

    await expect(
      uc.execute({
        postId: VALID_POST_ID,
        authorId: VALID_USER_ID,
        body: "댓글",
      }),
    ).rejects.toThrow(PostNotFoundError);
  });

  it("빈 body이면 InvalidCommentBodyError를 던진다", async () => {
    const postRepo = makePostRepo();
    const commentRepo = makeCommentRepo();
    const uc = new CreateComment(postRepo, commentRepo);

    await expect(
      uc.execute({
        postId: VALID_POST_ID,
        authorId: VALID_USER_ID,
        body: "",
      }),
    ).rejects.toThrow(InvalidCommentBodyError);
  });

  it("유효하지 않은 postId이면 InvalidUuidError를 던진다", async () => {
    const postRepo = makePostRepo();
    const commentRepo = makeCommentRepo();
    const uc = new CreateComment(postRepo, commentRepo);

    await expect(
      uc.execute({
        postId: "bad",
        authorId: VALID_USER_ID,
        body: "댓글",
      }),
    ).rejects.toThrow(InvalidUuidError);
  });

  it("유효하지 않은 authorId이면 InvalidUuidError를 던진다", async () => {
    const postRepo = makePostRepo();
    const commentRepo = makeCommentRepo();
    const uc = new CreateComment(postRepo, commentRepo);

    await expect(
      uc.execute({
        postId: VALID_POST_ID,
        authorId: "bad",
        body: "댓글",
      }),
    ).rejects.toThrow(InvalidUuidError);
  });
});
