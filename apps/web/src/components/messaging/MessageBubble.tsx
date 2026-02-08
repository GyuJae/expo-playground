import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { MessageDTO } from "@/lib/dto/types";

interface Props {
  message: MessageDTO;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatRelativeTime(new Date(message.createdAt))}
        </p>
      </div>
    </div>
  );
}
