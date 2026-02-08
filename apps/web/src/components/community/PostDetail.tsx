import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { PostDTO } from "@/lib/dto/types";

interface Props {
  post: PostDTO;
}

export function PostDetail({ post }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{post.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatRelativeTime(new Date(post.createdAt))}
        </p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.body}</p>
      </CardContent>
    </Card>
  );
}
