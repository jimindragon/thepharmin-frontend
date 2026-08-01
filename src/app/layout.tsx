import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SessionProvider } from "@/components/session/SessionProvider";
import { readBusinessSession, readPersonalSession } from "@/lib/session.server";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "THE PHARMA Recruit.",
  description: "제약·바이오 전문 채용공고 목록",
};

/**
 * 세션 쿠키는 여기서 한 번만 읽어 SessionProvider로 내려준다 — 클라이언트가
 * document.cookie를 직접 읽으면 useState 초기값과 하이드레이션이 어긋나 첫 렌더가 깜빡인다.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isPersonalLoggedIn, isBusinessLoggedIn] = await Promise.all([
    readPersonalSession(),
    readBusinessSession(),
  ]);

  return (
    <html lang="ko">
      <body>
        <SessionProvider isPersonalLoggedIn={isPersonalLoggedIn} isBusinessLoggedIn={isBusinessLoggedIn}>
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
