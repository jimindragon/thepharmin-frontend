import type { ReactNode } from "react";
import clsx from "clsx";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Eyebrow, PageTitle, typeScale } from "@/components/ui/Typography";

interface PageHeaderProps {
  breadcrumbLabel: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** QNA 유형 전환 버튼처럼 제목 옆에 들어가는 우측 액션. 좁은 화면에서는 자동으로 아래로 줄바꿈된다 */
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * 글로벌 헤더 바로 아래에 오는 표준 상단 구조: 브레드크럼 → 영문 소제목 → 제목 → 설명.
 * 자료실/QNA/캘린더/기업정보 네 페이지가 이 컴포넌트로 정렬·타이포그래피를 공유한다.
 * 모바일(≤760px)에서는 브레드크럼·아이브로우를 모두 숨기고 제목의 mt까지 상쇄해
 * h1이 app-shell 상단 여백 바로 아래에서 시작하게 한다.
 */
export function PageHeader({ breadcrumbLabel, eyebrow, title, description, rightSlot, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <PageBreadcrumb className="mb-5" items={[{ label: breadcrumbLabel }]} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Eyebrow는 className을 받지 않으므로(한글 아이브로우 보호 위해 공용 컴포넌트 미변경) 래퍼로 숨긴다 */}
          <div className="max-[760px]:hidden">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <PageTitle className="max-[760px]:mt-0">{title}</PageTitle>
          {description ? <p className={clsx("mt-3 max-w-[640px]", typeScale.body, "text-[#596373]")}>{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
