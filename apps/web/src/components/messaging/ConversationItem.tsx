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
      {summary.lastMessage && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(new Date(summary.lastMessage.createdAt))}
        </span>
      )}
    </Link>
  );
}
