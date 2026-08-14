import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";

/**
 * 허브 하위 목록 페이지(면접 후기·기업 리뷰)의 제목 영역.
 *
 * 종전에는 (hub)/layout.tsx가 이 블록을 들고 세 화면이 함께 썼다. 허브 첫 화면이 사진 히어로로
 * 바뀌면서 두 목록 페이지만 이 제목을 계속 쓰게 돼, 라우트 그룹 하나를 더 파 그쪽으로 내렸다.
 * 그때 브레드크럼·아이브로우·h1·설명을 손으로 복제해 옮겼는데, 복제본의 값이 정본에서 미세하게
 * 어긋나 있었다 — h1은 mt-4·#171d26·모바일 26px, 설명은 leading-1.7·#68717e였다.
 *
 * 이제 PageHeader를 그대로 부르므로 자료실·QNA·캘린더·허브와 같은 값(h1 mt-5·#242b36·모바일
 * 24px, 설명 leading-1.65·#596373)으로 수렴한다. 두 화면에 그만큼의 픽셀 변화가 생기는 것이 의도다.
 *
 * mobileDescription은 지정하지 않는다 — 종전 마크업에도 설명의 ≤760px 분기가 없었고, 이 두 화면은
 * 탭바로 오가며 h1 아래 컨트롤 위치를 서로 맞춰야 하는 구조가 아니다.
 */
export default function CompaniesFeedsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell pt-8">
      <PageHeader
        breadcrumbLabel="기업 인사이트"
        eyebrow="THE PHARMA COMPANIES"
        title="기업 인사이트"
        description="기업 정보부터 기업 리뷰와 면접 후기까지"
      />
      {children}
    </div>
  );
}
