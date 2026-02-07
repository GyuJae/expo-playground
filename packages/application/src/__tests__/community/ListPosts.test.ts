import { describe, it, expect, vi } from "vitest";
import {
  Post,
  PostContent,
  createPostId,
  createUserId,
} from "@expo-playground/domain";
import type { PostRepository } from "../../community/ports/PostRepository.js";
import { ListPosts } from "../../community/use-cases/ListPosts.js";

function makePost(id: string): Post {
  return Post.reconstruct({
    id: createPostId(id),
    authorId: createUserId("550e8400-e29b-41d4-a716-446655440000"),
    content: PostContent.reconstruct("제목", "본문"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  });
}

describe("ListPosts", () => {
  it("전체 게시글 목록을 반환한다", async () => {
    const posts = [
      makePost("11111111-1111-1111-1111-111111111111"),
      makePost("22222222-2222-2222-2222-222222222222"),
    ];
    const postRepo: PostRepository = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(posts),
      save: vi.fn(),
    };
    const uc = new ListPosts(postRepo);

    const result = await uc.execute();

    expect(result).toHaveLength(2);
    expect(result).toBe(posts);
  });

  it("게시글이 없으면 빈 배열을 반환한다", async () => {
    const postRepo: PostRepository = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
    };
    const uc = new ListPosts(postRepo);

    const result = await uc.execute();

    expect(result).toHaveLength(0);
  });
});
