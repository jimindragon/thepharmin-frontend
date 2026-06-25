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
 */
export function PageHeader({ breadcrumbLabel, eyebrow, title, description, rightSlot, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <PageBreadcrumb className="mb-5" items={[{ label: breadcrumbLabel }]} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{eyebrow}</Eyebrow>
          <PageTitle>{title}</PageTitle>
          {description ? <p className={clsx("mt-3 max-w-[640px]", typeScale.body, "text-[#596373]")}>{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
