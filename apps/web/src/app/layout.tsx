import type { Metadata } from "next";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expo Playground",
  description: "앱+웹 채팅 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
