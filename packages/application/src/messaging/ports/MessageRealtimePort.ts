import type { Message } from "@expo-playground/domain";

/** 구독 해제 핸들 */
export interface RealtimeSubscription {
  unsubscribe(): Promise<void>;
}

/** 새 메시지 실시간 구독 포트 */
export interface MessageRealtimePort {
  onNewMessage(
    conversationId: string,
    callback: (message: Message) => void,
  ): RealtimeSubscription;
}
