import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { DevStatePanel } from "@/components/dev/DevStatePanel";
import { MigrationGuard } from "@/components/migration/MigrationGuard";
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
          <MigrationGuard>{children}</MigrationGuard>
          <Footer />
          {/* 개발용 상태 전환 패널 — 임시 장치. 노출 여부는 DevStatePanel 내부 상수 한 곳에서만 정한다.
              삭제 방법은 components/dev/DevStatePanel.tsx 상단 주석 참고. */}
          <DevStatePanel />
        </SessionProvider>
      </body>
    </html>
  );
}
