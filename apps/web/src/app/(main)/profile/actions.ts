"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveUseCase } from "@/lib/server/container";
import { GetProfile, UpdateProfile } from "@expo-playground/application";
import { toUserDTO } from "@/lib/dto/serializers";
import type { UserDTO } from "@/lib/dto/types";

/** 현재 로그인 사용자의 프로필 조회 */
export async function fetchProfile(): Promise<UserDTO> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다");

  const useCase = await resolveUseCase(GetProfile);
  const profile = await useCase.execute(user.id);
  return toUserDTO(profile);
}

/** 프로필 수정 (닉네임) */
export async function updateProfile(formData: FormData): Promise<UserDTO> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다");

  const nickname = formData.get("nickname") as string;

  const useCase = await resolveUseCase(UpdateProfile);
  const profile = await useCase.execute({
    userId: user.id,
    nickname,
  });
  return toUserDTO(profile);
}
