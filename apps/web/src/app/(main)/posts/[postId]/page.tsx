import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PostDetail } from "@/components/community/PostDetail";
import { CommentSection } from "@/components/community/CommentSection";
import { fetchPostDetail, fetchComments } from "../../actions";

interface Props {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params;
  const [post, comments] = await Promise.all([
    fetchPostDetail(postId),
    fetchComments(postId),
  ]);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>
      <PostDetail post={post} />
      <CommentSection
        postId={postId}
        initialComments={comments}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
