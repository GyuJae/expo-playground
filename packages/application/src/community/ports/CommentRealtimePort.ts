import type { Comment } from "@expo-playground/domain";

/** 구독 해제 핸들 */
export interface RealtimeSubscription {
  unsubscribe(): Promise<void>;
}

/** 새 댓글 실시간 구독 포트 */
export interface CommentRealtimePort {
  onNewComment(
    postId: string,
    callback: (comment: Comment) => void,
  ): RealtimeSubscription;
}
