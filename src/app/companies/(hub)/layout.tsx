import type { ReactNode } from "react";
import { Header } from "@/components/Header";

/**
 * (hub) 그룹의 공통 크롬만 담당한다 — 헤더와 회색 배경 본문까지.
 *
 * 제목 영역(브레드크럼·Eyebrow·h1·부제)과 .app-shell은 여기 있지 않고 (feeds)/layout.tsx로 내려가 있다.
 * 허브 첫 화면(/companies)은 화면 폭을 꽉 채우는 사진 히어로가 그 자리를 대신하는데, 히어로는
 * 셸 밖에 서야 하고 하위 목록 페이지(면접 후기·기업 리뷰)에는 뜨면 안 되기 때문이다.
 * 그래서 이 레이아웃은 children을 셸로 감싸지 않는다 — 셸은 각 화면이 직접 세운다.
 */
export default function CompaniesHubLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="bg-[#f7f8fa] pb-20">{children}</main>
    </>
  );
}
