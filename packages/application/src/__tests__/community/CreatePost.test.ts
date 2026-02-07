import { describe, it, expect, vi } from "vitest";
import {
  InvalidUuidError,
  InvalidPostTitleError,
  InvalidPostBodyError,
} from "@expo-playground/domain";
import type { PostRepository } from "../../community/ports/PostRepository.js";
import { CreatePost } from "../../community/use-cases/CreatePost.js";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

function makePostRepo(): PostRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe("CreatePost", () => {
  it("게시글을 생성하고 저장한다", async () => {
    const postRepo = makePostRepo();
    const uc = new CreatePost(postRepo);

    const result = await uc.execute({
      authorId: VALID_UUID,
      title: "테스트 제목",
      body: "테스트 본문입니다",
    });

    expect(result.content.title).toBe("테스트 제목");
    expect(result.content.body).toBe("테스트 본문입니다");
    expect(result.authorId).toBe(VALID_UUID);
    expect(postRepo.save).toHaveBeenCalledOnce();
  });

  it("생성된 게시글에 UUID 형식의 ID가 있다", async () => {
    const postRepo = makePostRepo();
    const uc = new CreatePost(postRepo);

    const result = await uc.execute({
      authorId: VALID_UUID,
      title: "제목",
      body: "본문",
    });

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("유효하지 않은 authorId이면 InvalidUuidError를 던진다", async () => {
    const postRepo = makePostRepo();
    const uc = new CreatePost(postRepo);

    await expect(
      uc.execute({ authorId: "bad", title: "제목", body: "본문" }),
    ).rejects.toThrow(InvalidUuidError);
  });

  it("빈 제목이면 InvalidPostTitleError를 던진다", async () => {
    const postRepo = makePostRepo();
    const uc = new CreatePost(postRepo);

    await expect(
      uc.execute({ authorId: VALID_UUID, title: "", body: "본문" }),
    ).rejects.toThrow(InvalidPostTitleError);
  });

  it("빈 본문이면 InvalidPostBodyError를 던진다", async () => {
    const postRepo = makePostRepo();
    const uc = new CreatePost(postRepo);

    await expect(
      uc.execute({ authorId: VALID_UUID, title: "제목", body: "" }),
    ).rejects.toThrow(InvalidPostBodyError);
  });
});
