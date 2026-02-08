import Link from "next/link";
import { MessageSquare, Home, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          커뮤니티
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link
            href="/dm"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
          >
            <UserCircle className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
