import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  Comment,
  CommentBody,
  Post,
  PostContent,
  createCommentId,
  createPostId,
  createUserId,
  type CommentId,
  type PostId,
} from "@expo-playground/domain";
import { SupabaseCommentRepository } from "../supabase/SupabaseCommentRepository.js";
import { SupabasePostRepository } from "../supabase/SupabasePostRepository.js";
import { createAdminClient } from "./helpers/test-client.js";
import { cleanDatabase } from "./helpers/test-db.js";
import { createTestAuthUser } from "./helpers/test-auth.js";
import type { RealtimeChannel } from "@supabase/supabase-js";

const admin = createAdminClient();
const commentRepo = new SupabaseCommentRepository(admin);
const postRepo = new SupabasePostRepository(admin);

let activeChannel: RealtimeChannel | null = null;

beforeEach(async () => {
  await cleanDatabase(admin);
});

afterEach(async () => {
  if (activeChannel) {
    await admin.removeChannel(activeChannel);
    activeChannel = null;
  }
  // Realtime 채널 정리 후 안정화 대기
  await new Promise((r) => setTimeout(r, 500));
});

/** 채널 구독이 SUBSCRIBED 상태가 될 때까지 대기 (재시도 포함) */
async function waitForSubscribed(channel: RealtimeChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("구독 타임아웃")), 15000);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}

/** 조건이 충족될 때까지 폴링 */
async function waitFor(
  condition: () => boolean,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitFor 타임아웃");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** 테스트용 Post 생성 + 저장 */
async function createAndSavePost(authorId: string): Promise<Post> {
  const post = Post.create({
    id: createPostId(crypto.randomUUID()) as PostId,
    authorId: createUserId(authorId),
    content: PostContent.create("테스트 게시글", "본문"),
    createdAt: new Date(),
  });
  await postRepo.save(post);
  return post;
}

describe("SupabaseCommentRealtime", () => {
  it("INSERT 이벤트를 수신한다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);
    const postId = post.id as string;

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // 댓글 삽입
    const comment = Comment.create({
      id: createCommentId(crypto.randomUUID()) as CommentId,
      postId: post.id,
      authorId: createUserId(user.id),
      body: CommentBody.create("실시간 댓글"),
      createdAt: new Date(),
    });
    await commentRepo.save(comment);

    await waitFor(() => received.length >= 1);

    expect(received).toHaveLength(1);
    expect((received[0] as { body: string }).body).toBe("실시간 댓글");
  }, 15000);

  it("다른 게시글의 댓글은 수신하지 않는다", async () => {
    const user = await createTestAuthUser(admin);
    const post1 = await createAndSavePost(user.id);
    const post2 = await createAndSavePost(user.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-comments:${post1.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${post1.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    activeChannel = channel;
    await waitForSubscribed(channel);

    // post2에 댓글 삽입
    const comment = Comment.create({
      id: createCommentId(crypto.randomUUID()) as CommentId,
      postId: post2.id,
      authorId: createUserId(user.id),
      body: CommentBody.create("다른 게시글 댓글"),
      createdAt: new Date(),
    });
    await commentRepo.save(comment);

    await new Promise((r) => setTimeout(r, 2000));
    expect(received).toHaveLength(0);
  }, 20000);

  it("구독 해제 후 이벤트를 수신하지 않는다", async () => {
    const user = await createTestAuthUser(admin);
    const post = await createAndSavePost(user.id);

    const received: Record<string, unknown>[] = [];
    const channel = admin
      .channel(`test-comments-unsub:${post.id as string}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${post.id as string}`,
        },
        (payload) => {
          received.push(payload.new);
        },
      );

    await waitForSubscribed(channel);
    await admin.removeChannel(channel);

    // 댓글 삽입
    const comment = Comment.create({
      id: createCommentId(crypto.randomUUID()) as CommentId,
      postId: post.id,
      authorId: createUserId(user.id),
      body: CommentBody.create("구독 해제 후"),
      createdAt: new Date(),
    });
    await commentRepo.save(comment);

    await new Promise((r) => setTimeout(r, 2000));
    expect(received).toHaveLength(0);
  }, 20000);
});
