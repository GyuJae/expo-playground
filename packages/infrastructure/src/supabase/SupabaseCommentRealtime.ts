import { injectable, inject } from "tsyringe";
import {
  Comment,
  CommentBody,
  createCommentId,
  createPostId,
  createUserId,
  type Comment as CommentType,
} from "@expo-playground/domain";
import type {
  CommentRealtimePort,
  CommentRealtimeSubscription as RealtimeSubscription,
} from "@expo-playground/application";
import type { SupabaseClient } from "./client.js";

/** comments 테이블 행 타입 (Realtime payload) */
interface CommentPayload {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** payload → Comment 도메인 엔티티 */
function payloadToDomain(payload: CommentPayload): CommentType {
  return Comment.reconstruct({
    id: createCommentId(payload.id),
    postId: createPostId(payload.post_id),
    authorId: createUserId(payload.author_id),
    body: CommentBody.reconstruct(payload.body),
    createdAt: new Date(payload.created_at),
    updatedAt: new Date(payload.updated_at),
    deletedAt: payload.deleted_at ? new Date(payload.deleted_at) : null,
  });
}

/**
 * Supabase Realtime 기반 CommentRealtimePort 구현
 */
@injectable()
export class SupabaseCommentRealtime implements CommentRealtimePort {
  constructor(
    @inject("SupabaseClient") private client: SupabaseClient,
  ) {}

  onNewComment(
    postId: string,
    callback: (comment: CommentType) => void,
  ): RealtimeSubscription {
    const channel = this.client
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          callback(payloadToDomain(payload.new as CommentPayload));
        },
      )
      .subscribe();

    return {
      unsubscribe: async () => {
        await this.client.removeChannel(channel);
      },
    };
  }
}
