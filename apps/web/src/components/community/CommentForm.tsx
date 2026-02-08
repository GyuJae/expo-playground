"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCommentAction } from "@/app/(main)/actions";
import type { CommentDTO } from "@/lib/dto/types";

interface Props {
  postId: string;
  onCreated: (comment: CommentDTO) => void;
}

export function CommentForm({ postId, onCreated }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      const comment = await createCommentAction(postId, formData);
      onCreated(comment);
      formRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-2">
      <Textarea name="body" placeholder="댓글을 입력하세요" rows={3} required />
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "작성 중..." : "댓글 작성"}
      </Button>
    </form>
  );
}
