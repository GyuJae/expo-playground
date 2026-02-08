import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { PostDTO } from "@/lib/dto/types";

interface Props {
  post: PostDTO;
  authorName?: string;
}

export function PostCard({ post, authorName }: Props) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {post.body}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{authorName ?? "사용자"}</span>
            <span>&middot;</span>
            <span>{formatRelativeTime(new Date(post.createdAt))}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
