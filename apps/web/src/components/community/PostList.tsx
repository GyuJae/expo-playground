import { PostCard } from "./PostCard";
import type { PostDTO } from "@/lib/dto/types";

interface Props {
  posts: PostDTO[];
}

export function PostList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        아직 게시글이 없습니다. 첫 번째 글을 작성해 보세요!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
