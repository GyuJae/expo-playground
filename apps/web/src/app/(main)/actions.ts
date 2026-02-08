"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveUseCase } from "@/lib/server/container";
import {
  ListPosts,
  CreatePost,
  GetPostDetail,
  CreateComment,
  ListComments,
  UpdateComment,
  DeleteComment,
  GetProfile,
} from "@expo-playground/application";
import { toPostDTO, toCommentDTO, toUserDTO } from "@/lib/dto/serializers";
import type { PostDTO, CommentDTO, UserDTO } from "@/lib/dto/types";

/** 현재 인증 사용자 ID 조회 */
async function requireAuth(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다");
  return user.id;
}

/** 게시글 목록 조회 */
export async function fetchPosts(): Promise<PostDTO[]> {
  const useCase = await resolveUseCase(ListPosts);
  const posts = await useCase.execute();
  return posts.map(toPostDTO);
}

/** 게시글 작성 */
export async function createPostAction(formData: FormData): Promise<PostDTO> {
  const userId = await requireAuth();
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  const useCase = await resolveUseCase(CreatePost);
  const post = await useCase.execute({ authorId: userId, title, body });
  revalidatePath("/");
  return toPostDTO(post);
}

/** 게시글 상세 조회 */
export async function fetchPostDetail(postId: string): Promise<PostDTO> {
  const useCase = await resolveUseCase(GetPostDetail);
  const post = await useCase.execute(postId);
  return toPostDTO(post);
}

/** 댓글 목록 조회 */
export async function fetchComments(postId: string): Promise<CommentDTO[]> {
  const useCase = await resolveUseCase(ListComments);
  const comments = await useCase.execute(postId);
  return comments.map(toCommentDTO);
}

/** 댓글 작성 */
export async function createCommentAction(postId: string, formData: FormData): Promise<CommentDTO> {
  const userId = await requireAuth();
  const body = formData.get("body") as string;

  const useCase = await resolveUseCase(CreateComment);
  const comment = await useCase.execute({ postId, authorId: userId, body });
  revalidatePath(`/posts/${postId}`);
  return toCommentDTO(comment);
}

/** 댓글 수정 */
export async function updateCommentAction(
  commentId: string,
  postId: string,
  formData: FormData,
): Promise<CommentDTO> {
  const userId = await requireAuth();
  const body = formData.get("body") as string;

  const useCase = await resolveUseCase(UpdateComment);
  const comment = await useCase.execute({ commentId, requesterId: userId, body });
  revalidatePath(`/posts/${postId}`);
  return toCommentDTO(comment);
}

/** 댓글 삭제 */
export async function deleteCommentAction(commentId: string, postId: string): Promise<void> {
  const userId = await requireAuth();

  const useCase = await resolveUseCase(DeleteComment);
  await useCase.execute({ commentId, requesterId: userId });
  revalidatePath(`/posts/${postId}`);
}

/** 사용자 프로필 조회 (닉네임 표시용) */
export async function fetchUserProfile(userId: string): Promise<UserDTO | null> {
  try {
    const useCase = await resolveUseCase(GetProfile);
    const user = await useCase.execute(userId);
    return toUserDTO(user);
  } catch {
    return null;
  }
}
