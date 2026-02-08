"use client";

import { useEffect } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import type { CommentDTO } from "@/lib/dto/types";

/**
 * Supabase Realtime으로 댓글 INSERT 이벤트를 구독한다.
 * — 다른 사용자가 작성한 댓글을 실시간으로 받아온다.
 */
export function useRealtimeComments(
  postId: string,
  onNewComment: (comment: CommentDTO) => void,
) {
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
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
          const row = payload.new as Record<string, unknown>;
          const comment: CommentDTO = {
            id: row.id as string,
            postId: row.post_id as string,
            authorId: row.author_id as string,
            body: row.body as string,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
          };
          onNewComment(comment);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, postId, onNewComment]);
}
