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
  /**
   * rightSlot을 감싸는 칸에 얹을 클래스. 특정 폭에서 우측 액션을 통째로 걷어낼 때 쓴다 —
   * 안쪽 내용만 숨기면 빈 칸이 flex 아이템으로 남아 줄바꿈된 2행이 생기고 row-gap 16px이 그대로 붙는다.
   */
  rightSlotClassName?: string;
  /**
   * ≤760px에서 보조문구를 어떻게 다룰지. 미지정이면 데스크톱과 같은 본문 크기 그대로다.
   * hidden: 탭 라벨·범례가 이미 같은 정보를 주는 화면(캘린더)에서 통째로 접는다.
   * caption: 문구가 그 화면의 유일한 해설이라 지울 수 없을 때(QNA 약사/산업 구분) 한 줄로 줄인다.
   * 탭바로 오가는 페이지에서만 켠다 — 첫 화면에서 h1 아래 컨트롤 위치를 서로 맞추기 위한 것이다.
   */
  mobileDescription?: "hidden" | "caption";
  className?: string;
}

const MOBILE_DESCRIPTION_CLASS = {
  hidden: "max-[760px]:hidden",
  caption:
    "max-[760px]:mt-2 max-[760px]:line-clamp-1 max-[760px]:text-[12px] max-[760px]:leading-[1.5] max-[760px]:text-[#8a94a3]",
} as const;

/**
 * 글로벌 헤더 바로 아래에 오는 표준 상단 구조: 브레드크럼 → 영문 소제목 → 제목 → 설명.
 * 자료실/QNA/캘린더/기업정보 네 페이지가 이 컴포넌트로 정렬·타이포그래피를 공유한다.
 * 모바일(≤760px)에서는 브레드크럼·아이브로우를 모두 숨기고 제목의 mt까지 상쇄해
 * h1이 app-shell 상단 여백 바로 아래에서 시작하게 한다.
 */
export function PageHeader({
  breadcrumbLabel,
  eyebrow,
  title,
  description,
  rightSlot,
  rightSlotClassName,
  mobileDescription,
  className,
}: PageHeaderProps) {
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
          {description ? (
            <p
              className={clsx(
                "mt-3 max-w-[640px]",
                typeScale.body,
                "text-[#596373]",
                mobileDescription && MOBILE_DESCRIPTION_CLASS[mobileDescription],
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {rightSlot ? <div className={clsx("shrink-0", rightSlotClassName)}>{rightSlot}</div> : null}
      </div>
    </div>
  );
}
