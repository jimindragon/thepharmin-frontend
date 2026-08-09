import type { Metadata, Viewport } from "next";
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
 * width/initialScale은 Next의 기본값과 같지만, viewportFit을 주려면 이 export를 직접 소유해야 한다.
 * viewport-fit=cover가 없으면 iOS가 env(safe-area-inset-*)를 전부 0으로 돌려준다 —
 * 하단 탭바(MobileTabBar)의 pb-[env(safe-area-inset-bottom)]과 globals.css의 본문 하단 보정이
 * 실기기에서만 조용히 무효가 되어 탭바가 홈 인디케이터·사파리 하단 바에 겹친다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
