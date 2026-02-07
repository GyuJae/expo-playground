import { injectable, inject } from "tsyringe";
import {
  Post,
  PostContent,
  createUserId,
  createPostId,
  type PostId,
} from "@expo-playground/domain";
import type { PostRepository } from "../ports/PostRepository.js";
import { DI_TOKENS } from "../../shared/tokens.js";

interface CreatePostInput {
  authorId: string;
  title: string;
  body: string;
}

/**
 * 게시글 생성 유스케이스
 */
@injectable()
export class CreatePost {
  constructor(
    @inject(DI_TOKENS.PostRepository) private postRepo: PostRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const authorId = createUserId(input.authorId);
    const content = PostContent.create(input.title, input.body);
    const postId = createPostId(crypto.randomUUID()) as PostId;
    const now = new Date();

    const post = Post.create({
      id: postId,
      authorId,
      content,
      createdAt: now,
    });

    await this.postRepo.save(post);
    return post;
  }
}
