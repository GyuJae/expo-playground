"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/app/(main)/profile/actions";
import type { UserDTO } from "@/lib/dto/types";

interface Props {
  initialProfile: UserDTO;
}

export function ProfileForm({ initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>프로필 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />}
            <AvatarFallback className="text-lg">
              {profile.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{profile.nickname}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
              닉네임
            </label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={profile.nickname}
              maxLength={30}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
