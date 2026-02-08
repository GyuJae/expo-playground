import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/community/PostList";
import { fetchPosts } from "./actions";

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시글</h1>
        <Button asChild>
          <Link href="/posts/new">
            <Plus className="h-4 w-4" />
            글쓰기
          </Link>
        </Button>
      </div>
      <PostList posts={posts} />
    </div>
  );
}
