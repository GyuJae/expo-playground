import { Suspense } from "react";
import { NewConversationForm } from "@/components/messaging/NewConversationForm";

export default function NewConversationPage() {
  return (
    <Suspense>
      <NewConversationForm />
    </Suspense>
  );
}
