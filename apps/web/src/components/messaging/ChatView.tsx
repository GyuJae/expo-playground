"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useRealtimeReadReceipts } from "@/hooks/useRealtimeReadReceipts";
import { markAsReadAction } from "@/app/(main)/dm/actions";
import type { MessageDTO, ReadPositionDTO } from "@/lib/dto/types";

interface Props {
  conversationId: string;
  initialMessages: MessageDTO[];
  currentUserId: string;
  initialReadPositions: ReadPositionDTO[];
}

export function ChatView({
  conversationId,
  initialMessages,
  currentUserId,
  initialReadPositions,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [readPositions, setReadPositions] = useState(initialReadPositions);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 대화 진입 시 읽음 처리
  useEffect(() => {
    markAsReadAction(conversationId).catch(() => {});
  }, [conversationId]);

  const handleSent = useCallback((message: MessageDTO) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleRealtimeMessage = useCallback(
    (message: MessageDTO) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // 새 메시지 수신 시 읽음 처리
      markAsReadAction(conversationId).catch(() => {});
    },
    [conversationId],
  );

  const handleReadPositionChanged = useCallback((rp: ReadPositionDTO) => {
    setReadPositions((prev) => {
      const idx = prev.findIndex((p) => p.userId === rp.userId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rp;
        return next;
      }
      return [...prev, rp];
    });
  }, []);

  useRealtimeMessages(conversationId, handleRealtimeMessage);
  useRealtimeReadReceipts(conversationId, handleReadPositionChanged);

  // 상대방의 읽음 위치 계산
  const otherReadPosition = readPositions.find(
    (rp) => rp.userId !== currentUserId,
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          const isRead =
            isOwn &&
            otherReadPosition != null &&
            new Date(message.createdAt).getTime() <=
              new Date(otherReadPosition.lastReadAt).getTime();

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              isRead={isRead}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
      <ChatInput conversationId={conversationId} onSent={handleSent} />
    </div>
  );
}
