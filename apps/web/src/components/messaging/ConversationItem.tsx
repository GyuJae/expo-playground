import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import type { ConversationSummaryDTO } from "@/lib/dto/types";

interface Props {
  summary: ConversationSummaryDTO;
  currentUserId: string;
}

export function ConversationItem({ summary, currentUserId }: Props) {
  const otherMember = summary.conversation.members.find(
    (m) => m.userId !== currentUserId,
  );

  const unread = summary.unreadCount;

  return (
    <Link
      href={`/dm/${summary.conversation.id}`}
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
        {(otherMember?.userId ?? "?").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {otherMember?.userId ?? "알 수 없음"}
        </p>
        {summary.lastMessage && (
          <p className="truncate text-xs text-muted-foreground">
            {summary.lastMessage.body}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {summary.lastMessage && (
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(new Date(summary.lastMessage.createdAt))}
          </span>
        )}
        {unread > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
    </Link>
  );
}
