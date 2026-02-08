"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateConversationAction } from "@/app/(main)/dm/actions";

export function NewConversationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError("");
    try {
      const conversation = await getOrCreateConversationAction(userId.trim());
      router.push(`/dm/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "대화를 생성할 수 없습니다");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>새 대화</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userId" className="mb-1 block text-sm font-medium">
                상대방 사용자 ID
              </label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="사용자 UUID를 입력하세요"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "생성 중..." : "대화 시작"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
