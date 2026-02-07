import { injectable, inject } from "tsyringe";
import {
  Comment,
  CommentBody,
  createUserId,
  createPostId,
  createCommentId,
  type CommentId,
} from "@expo-playground/domain";
import type { PostRepository } from "../ports/PostRepository.js";
import type { CommentRepository } from "../ports/CommentRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";
import { PostNotFoundError } from "../../shared/errors.js";

interface CreateCommentInput {
  postId: string;
  authorId: string;
  body: string;
}

/**
 * 댓글 생성 유스케이스
 */
@injectable()
export class CreateComment {
  constructor(
    @inject(DI_TOKENS.PostRepository) private postRepo: PostRepository,
    @inject(DI_TOKENS.CommentRepository)
    private commentRepo: CommentRepository,
  ) {}

  async execute(input: CreateCommentInput): Promise<Comment> {
    const postId = createPostId(input.postId);
    const authorId = createUserId(input.authorId);
    const body = CommentBody.create(input.body);

    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new PostNotFoundError(input.postId);
    }

    const commentId = createCommentId(crypto.randomUUID()) as CommentId;
    const now = new Date();

    const comment = Comment.create({
      id: commentId,
      postId,
      authorId,
      body,
      createdAt: now,
    });

    await this.commentRepo.save(comment);
    return comment;
  }
}
