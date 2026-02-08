import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
}

export function ChatHeader({ title }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Link
        href="/dm"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}
