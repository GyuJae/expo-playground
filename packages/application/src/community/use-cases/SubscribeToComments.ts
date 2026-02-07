import { injectable, inject } from "tsyringe";
import { createPostId, type Comment } from "@expo-playground/domain";
import type { CommentRealtimePort, RealtimeSubscription } from "../ports/CommentRealtimePort.js";
import { DI_TOKENS } from "../../shared/tokens.js";

interface SubscribeToCommentsInput {
  postId: string;
  onComment: (comment: Comment) => void;
}

/**
 * 게시글 댓글 실시간 구독 유스케이스
 */
@injectable()
export class SubscribeToComments {
  constructor(
    @inject(DI_TOKENS.CommentRealtimePort)
    private realtime: CommentRealtimePort,
  ) {}

  async execute(input: SubscribeToCommentsInput): Promise<RealtimeSubscription> {
    // postId 유효성 검증
    createPostId(input.postId);

    return this.realtime.onNewComment(input.postId, input.onComment);
  }
}
