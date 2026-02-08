import { ChatHeader } from "@/components/messaging/ChatHeader";
import { ChatView } from "@/components/messaging/ChatView";
import { fetchMessages, getCurrentUserId } from "../actions";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { conversationId } = await params;
  const [messages, currentUserId] = await Promise.all([
    fetchMessages(conversationId),
    getCurrentUserId(),
  ]);

  return (
    <div>
      <ChatHeader title="대화" />
      <ChatView
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={currentUserId}
      />
    </div>
  );
}
