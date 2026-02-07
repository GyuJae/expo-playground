import { describe, it, expect, vi } from "vitest";
import { InvalidUuidError } from "@expo-playground/domain";
import type { CommentRealtimePort, RealtimeSubscription } from "../../community/ports/CommentRealtimePort.js";
import { SubscribeToComments } from "../../community/use-cases/SubscribeToComments.js";

const VALID_POST_ID = "550e8400-e29b-41d4-a716-446655440000";

function makeMockSubscription(): RealtimeSubscription {
  return { unsubscribe: vi.fn().mockResolvedValue(undefined) };
}

function makeRealtimePort(sub: RealtimeSubscription = makeMockSubscription()): CommentRealtimePort {
  return {
    onNewComment: vi.fn().mockReturnValue(sub),
  };
}

describe("SubscribeToComments", () => {
  it("구독에 성공한다", async () => {
    const realtime = makeRealtimePort();
    const uc = new SubscribeToComments(realtime);
    const callback = vi.fn();

    const sub = await uc.execute({
      postId: VALID_POST_ID,
      onComment: callback,
    });

    expect(realtime.onNewComment).toHaveBeenCalledWith(VALID_POST_ID, callback);
    expect(sub).toBeDefined();
  });

  it("유효하지 않은 postId이면 에러를 던진다", async () => {
    const realtime = makeRealtimePort();
    const uc = new SubscribeToComments(realtime);

    await expect(
      uc.execute({ postId: "bad", onComment: vi.fn() }),
    ).rejects.toThrow(InvalidUuidError);
  });

  it("구독 해제가 동작한다", async () => {
    const mockSub = makeMockSubscription();
    const realtime = makeRealtimePort(mockSub);
    const uc = new SubscribeToComments(realtime);

    const sub = await uc.execute({
      postId: VALID_POST_ID,
      onComment: vi.fn(),
    });

    await sub.unsubscribe();
    expect(mockSub.unsubscribe).toHaveBeenCalledOnce();
  });
});
