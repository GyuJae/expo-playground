import { injectable, inject } from "tsyringe";
import { createCommentId, createUserId } from "@expo-playground/domain";
import type { CommentRepository } from "../ports/CommentRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { CommentNotFoundError, UnauthorizedError } from "../../shared/errors.js";

interface DeleteCommentInput {
  commentId: string;
  requesterId: string;
}

/**
 * 댓글 삭제 유스케이스 — 작성자만 삭제 가능 (소프트 삭제)
 */
@injectable()
export class DeleteComment {
  constructor(
    @inject(DI_TOKENS.CommentRepository)
    private commentRepo: CommentRepository,
  ) {}

  async execute(input: DeleteCommentInput): Promise<void> {
    const commentId = createCommentId(input.commentId);
    const requesterId = createUserId(input.requesterId);

    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundError(input.commentId);
    }

    if (comment.authorId !== requesterId) {
      throw new UnauthorizedError("댓글 작성자만 삭제할 수 있습니다");
    }

    comment.softDelete(new Date());
    await this.commentRepo.save(comment);
  }
}
