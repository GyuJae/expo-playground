import { injectable, inject } from "tsyringe";
import { createPostId, type Comment } from "@expo-playground/domain";
import type { CommentRepository } from "../ports/CommentRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

/**
 * 게시글별 댓글 목록 조회 유스케이스
 */
@injectable()
export class ListComments {
  constructor(
    @inject(DI_TOKENS.CommentRepository)
    private commentRepo: CommentRepository,
  ) {}

  async execute(postId: string): Promise<Comment[]> {
    const id = createPostId(postId);
    return this.commentRepo.findByPostId(id);
  }
}
