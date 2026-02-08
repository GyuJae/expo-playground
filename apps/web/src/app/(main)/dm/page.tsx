import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/messaging/ConversationList";
import { fetchConversations, getCurrentUserId } from "./actions";

export default async function DmPage() {
  const [conversations, currentUserId] = await Promise.all([
    fetchConversations(),
    getCurrentUserId(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">메시지</h1>
        <Button asChild>
          <Link href="/dm/new">
            <Plus className="h-4 w-4" />
            새 대화
          </Link>
        </Button>
      </div>
      <ConversationList conversations={conversations} currentUserId={currentUserId} />
    </div>
  );
}
