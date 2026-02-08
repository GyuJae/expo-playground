"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPostAction } from "@/app/(main)/actions";

export function PostForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await createPostAction(formData);
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 게시글</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              제목
            </label>
            <Input
              id="title"
              name="title"
              placeholder="제목을 입력하세요"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label htmlFor="body" className="mb-1 block text-sm font-medium">
              내용
            </label>
            <Textarea
              id="body"
              name="body"
              placeholder="내용을 입력하세요"
              rows={10}
              maxLength={10000}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "작성 중..." : "작성"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
