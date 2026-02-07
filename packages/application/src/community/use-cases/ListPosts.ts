import { injectable, inject } from "tsyringe";
import type { Post } from "@expo-playground/domain";
import type { PostRepository } from "../ports/PostRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/**
 * 게시글 목록 조회 유스케이스
 * — 삭제 필터링은 PostRepository 구현체 책임
 */
@injectable()
export class ListPosts {
  constructor(
    @inject(DI_TOKENS.PostRepository) private postRepo: PostRepository,
  ) {}

  async execute(): Promise<Post[]> {
    return this.postRepo.findAll();
  }
}
