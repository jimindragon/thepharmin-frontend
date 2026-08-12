import type { ReactNode } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Eyebrow } from "@/components/ui/Typography";

/**
 * 허브 하위 목록 페이지(면접 후기·기업 리뷰)의 제목 영역.
 *
 * 종전에는 (hub)/layout.tsx가 이 블록을 들고 세 화면이 함께 썼다. 허브 첫 화면이 사진 히어로로
 * 바뀌면서 두 목록 페이지만 이 제목을 계속 쓰게 돼, 라우트 그룹 하나를 더 파 그쪽으로 내렸다.
 * 두 페이지의 렌더 결과는 종전과 같다 — 제목·브레드크럼·여백 값을 그대로 옮겨 왔다.
 */
export default function CompaniesFeedsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell pt-8">
      <PageBreadcrumb className="mb-5" items={[{ label: "기업 인사이트" }]} />
      <div className="max-[760px]:hidden">
        <Eyebrow>THE PHARMA COMPANIES</Eyebrow>
      </div>
      <h1 className="mt-4 whitespace-nowrap text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#171d26] max-[760px]:mt-0 max-[760px]:text-[26px]">
        기업 인사이트
      </h1>
      <p className="mt-3 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">기업 정보부터 기업 리뷰와 면접 후기까지</p>
      {children}
    </div>
  );
}
