"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/app/(main)/dm/actions";
import type { MessageDTO } from "@/lib/dto/types";

interface Props {
  conversationId: string;
  onSent: (message: MessageDTO) => void;
}

export function ChatInput({ conversationId, onSent }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const body = formData.get("body") as string;
    if (!body.trim()) return;

    setSending(true);
    try {
      const message = await sendMessageAction(conversationId, formData);
      onSent(message);
      formRef.current?.reset();
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <Textarea
        name="body"
        placeholder="메시지를 입력하세요..."
        rows={1}
        className="min-h-[40px] resize-none"
        onKeyDown={handleKeyDown}
        required
      />
      <Button type="submit" size="icon" disabled={sending}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
