import { describe, it, expect } from "vitest";
import { Message } from "../../../messaging/entities/Message.js";
import { MessageBody } from "../../../messaging/value-objects/MessageBody.js";
import {
  createMessageId,
  createConversationId,
  createUserId,
} from "../../../shared/types.js";

const MSG_ID = createMessageId("550e8400-e29b-41d4-a716-446655440000");
const CONV_ID = createConversationId("660e8400-e29b-41d4-a716-446655440000");
const SENDER_ID = createUserId("770e8400-e29b-41d4-a716-446655440000");
const CREATED_AT = new Date("2025-01-01T00:00:00Z");

function createTestMessage() {
  return Message.create({
    id: MSG_ID,
    conversationId: CONV_ID,
    senderId: SENDER_ID,
    body: MessageBody.create("테스트 메시지"),
    createdAt: CREATED_AT,
  });
}

describe("Message", () => {
  describe("create", () => {
    it("유효한 파라미터로 Message를 생성한다", () => {
      const msg = createTestMessage();
      expect(msg.id).toBe(MSG_ID);
      expect(msg.conversationId).toBe(CONV_ID);
      expect(msg.senderId).toBe(SENDER_ID);
      expect(msg.body.value).toBe("테스트 메시지");
      expect(msg.createdAt).toBe(CREATED_AT);
    });
  });

  describe("equals", () => {
    it("같은 ID의 Message는 동일하다", () => {
      const a = createTestMessage();
      const b = createTestMessage();
      expect(a.equals(b)).toBe(true);
    });

    it("다른 ID의 Message는 다르다", () => {
      const a = createTestMessage();
      const b = Message.create({
        id: createMessageId("880e8400-e29b-41d4-a716-446655440000"),
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        body: MessageBody.create("다른 메시지"),
        createdAt: CREATED_AT,
      });
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("reconstruct", () => {
    it("DB에서 복원한다", () => {
      const msg = Message.reconstruct({
        id: MSG_ID,
        conversationId: CONV_ID,
        senderId: SENDER_ID,
        body: MessageBody.reconstruct("DB메시지"),
        createdAt: CREATED_AT,
      });
      expect(msg.body.value).toBe("DB메시지");
      expect(msg.conversationId).toBe(CONV_ID);
    });
  });
});
