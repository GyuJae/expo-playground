import { describe, it, expect, vi } from "vitest";
import {
  Post,
  PostContent,
  createPostId,
  createUserId,
  InvalidUuidError,
} from "@expo-playground/domain";
import type { PostRepository } from "../../community/ports/PostRepository.js";
import { GetPostDetail } from "../../community/use-cases/GetPostDetail.js";
import { PostNotFoundError } from "../../shared/errors.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makePostRepo(post: Post | null = null): PostRepository {
  return {
    findById: vi.fn().mockResolvedValue(post),
    findAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makePost(): Post {
  return Post.reconstruct({
    id: createPostId(VALID_UUID),
    authorId: createUserId("11111111-1111-1111-1111-111111111111"),
    content: PostContent.reconstruct("제목", "본문"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  });
}

describe("GetPostDetail", () => {
  it("존재하는 게시글을 반환한다", async () => {
    const post = makePost();
    const postRepo = makePostRepo(post);
    const uc = new GetPostDetail(postRepo);

    const result = await uc.execute(VALID_UUID);

    expect(result).toBe(post);
  });

  it("게시글이 없으면 PostNotFoundError를 던진다", async () => {
    const postRepo = makePostRepo(null);
    const uc = new GetPostDetail(postRepo);

    await expect(uc.execute(VALID_UUID)).rejects.toThrow(PostNotFoundError);
  });

  it("유효하지 않은 UUID이면 InvalidUuidError를 던진다", async () => {
    const postRepo = makePostRepo(null);
    const uc = new GetPostDetail(postRepo);

    await expect(uc.execute("bad-uuid")).rejects.toThrow(InvalidUuidError);
  });
});
