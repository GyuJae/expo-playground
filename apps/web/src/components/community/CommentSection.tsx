"use client";

import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import type { CommentDTO } from "@/lib/dto/types";

interface Props {
  postId: string;
  initialComments: CommentDTO[];
  currentUserId: string;
}

export function CommentSection({ postId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments);

  function handleCreated(comment: CommentDTO) {
    setComments((prev) => [...prev, comment]);
  }

  function handleUpdate(updated: CommentDTO) {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">댓글 ({comments.length})</h2>
      <div>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <CommentForm postId={postId} onCreated={handleCreated} />
    </div>
  );
}
