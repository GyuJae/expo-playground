"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import type { MessageDTO } from "@/lib/dto/types";

interface Props {
  conversationId: string;
  initialMessages: MessageDTO[];
  currentUserId: string;
}

export function ChatView({ conversationId, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSent = useCallback((message: MessageDTO) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  /** Realtime에서 받은 메시지 추가 (외부에서 호출) */
  const addMessage = useCallback((message: MessageDTO) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  return (
    <ChatViewInner
      conversationId={conversationId}
      messages={messages}
      currentUserId={currentUserId}
      onSent={handleSent}
      addMessage={addMessage}
      bottomRef={bottomRef}
    />
  );
}

function ChatViewInner({
  conversationId,
  messages,
  currentUserId,
  onSent,
  bottomRef,
}: {
  conversationId: string;
  messages: MessageDTO[];
  currentUserId: string;
  onSent: (message: MessageDTO) => void;
  addMessage: (message: MessageDTO) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput conversationId={conversationId} onSent={onSent} />
    </div>
  );
}
