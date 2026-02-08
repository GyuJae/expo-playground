import { ConversationItem } from "./ConversationItem";
import type { ConversationSummaryDTO } from "@/lib/dto/types";

interface Props {
  conversations: ConversationSummaryDTO[];
  currentUserId: string;
}

export function ConversationList({ conversations, currentUserId }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        대화가 없습니다. 새 대화를 시작해 보세요!
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((summary) => (
        <ConversationItem
          key={summary.conversation.id}
          summary={summary}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
