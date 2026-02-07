import "reflect-metadata";
import { describe, it, expect, vi } from "vitest";
import { InvalidUuidError } from "@expo-playground/domain";
import { SupabaseAuthProvider } from "../supabase/SupabaseAuthProvider.js";

/** Mock SupabaseClient 생성 */
function createMockClient(overrides?: {
  data?: unknown;
  error?: { message: string } | null;
}) {
  return {
    auth: {
      signInWithIdToken: vi.fn().mockResolvedValue({
        data: overrides?.data ?? { user: null },
        error: overrides?.error ?? null,
      }),
    },
  } as never;
}

describe("SupabaseAuthProvider", () => {
  it("성공 시 userId + email을 반환한다", async () => {
    const userId = "550e8400-e29b-41d4-a716-446655440000";
    const email = "test@example.com";
    const client = createMockClient({
      data: { user: { id: userId, email } },
    });
    const provider = new SupabaseAuthProvider(client);

    const result = await provider.signInWithGoogle("valid-token");

    expect(result.userId).toBe(userId);
    expect(result.email).toBe(email);
  });

  it("인증 실패 시 에러를 던진다", async () => {
    const client = createMockClient({
      error: { message: "Invalid token" },
    });
    const provider = new SupabaseAuthProvider(client);

    await expect(provider.signInWithGoogle("bad-token")).rejects.toThrow(
      "Google 인증 실패",
    );
  });

  it("잘못된 UUID 형식이면 InvalidUuidError를 던진다", async () => {
    const client = createMockClient({
      data: { user: { id: "not-a-uuid", email: "test@example.com" } },
    });
    const provider = new SupabaseAuthProvider(client);

    await expect(provider.signInWithGoogle("token")).rejects.toThrow(
      InvalidUuidError,
    );
  });
});
