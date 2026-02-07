import { injectable, inject } from "tsyringe";
import { createPostId, type Post } from "@expo-playground/domain";
import type { PostRepository } from "../ports/PostRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { PostNotFoundError } from "../../shared/errors.js";

/**
 * 게시글 상세 조회 유스케이스
 */
@injectable()
export class GetPostDetail {
  constructor(
    @inject(DI_TOKENS.PostRepository) private postRepo: PostRepository,
  ) {}

  async execute(postId: string): Promise<Post> {
    const id = createPostId(postId);
    const post = await this.postRepo.findById(id);
    if (!post) {
      throw new PostNotFoundError(postId);
    }
    return post;
  }
}
