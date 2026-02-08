import type { ReadPosition } from "@expo-playground/domain";
import type { RealtimeSubscription } from "./MessageRealtimePort.js";

/** 읽음 위치 변경 실시간 구독 포트 */
export interface ReadReceiptRealtimePort {
  /** 대화의 읽음 위치 변경(INSERT/UPDATE)을 구독한다 */
  onReadPositionChanged(
    conversationId: string,
    callback: (readPosition: ReadPosition) => void,
  ): RealtimeSubscription;
}
