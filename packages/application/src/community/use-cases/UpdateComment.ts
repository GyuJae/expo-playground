import { injectable, inject } from "tsyringe";
import {
  CommentBody,
  createCommentId,
  createUserId,
  type Comment,
} from "@expo-playground/domain";
import type { CommentRepository } from "../ports/CommentRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { CommentNotFoundError, UnauthorizedError } from "../../shared/errors.js";

interface UpdateCommentInput {
  commentId: string;
  requesterId: string;
  body: string;
}

/**
 * 댓글 수정 유스케이스 — 작성자만 수정 가능
 */
@injectable()
export class UpdateComment {
  constructor(
    @inject(DI_TOKENS.CommentRepository)
    private commentRepo: CommentRepository,
  ) {}

  async execute(input: UpdateCommentInput): Promise<Comment> {
    const commentId = createCommentId(input.commentId);
    const requesterId = createUserId(input.requesterId);

    const comment = await this.commentRepo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundError(input.commentId);
    }

    if (comment.authorId !== requesterId) {
      throw new UnauthorizedError("댓글 작성자만 수정할 수 있습니다");
    }

    const newBody = CommentBody.create(input.body);
    comment.updateBody(newBody, new Date());

    await this.commentRepo.save(comment);
    return comment;
  }
}
