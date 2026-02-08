"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/format";
import { updateCommentAction, deleteCommentAction } from "@/app/(main)/actions";
import type { CommentDTO } from "@/lib/dto/types";

interface Props {
  comment: CommentDTO;
  currentUserId: string;
  onUpdate: (updated: CommentDTO) => void;
  onDelete: (commentId: string) => void;
}

export function CommentItem({ comment, currentUserId, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = comment.authorId === currentUserId;

  async function handleUpdate(formData: FormData) {
    const updated = await updateCommentAction(comment.id, comment.postId, formData);
    onUpdate(updated);
    setEditing(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCommentAction(comment.id, comment.postId);
      onDelete(comment.id);
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="border-b border-border py-3">
        <form action={handleUpdate} className="space-y-2">
          <Textarea name="body" defaultValue={comment.body} rows={3} required />
          <div className="flex gap-2">
            <Button type="submit" size="sm">저장</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              취소
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="border-b border-border py-3">
      <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatRelativeTime(new Date(comment.createdAt))}</span>
        {isOwner && (
          <>
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => setEditing(true)}
            >
              수정
            </button>
            <button
              type="button"
              className="hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
