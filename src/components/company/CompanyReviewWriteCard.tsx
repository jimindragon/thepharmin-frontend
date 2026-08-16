"use client";

import { LinkButton } from "@/components/ui/Button";

export type CompanyReviewWriteCardType = "company" | "interview";

interface CompanyReviewWriteCardProps {
  companyId: string;
  reviewType: CompanyReviewWriteCardType;
  isLoggedIn: boolean;
  hasItems: boolean;
}

const writeCopy: Record<CompanyReviewWriteCardType, { label: string; path: string; withItems: string; empty: string }> = {
  company: {
    label: "기업 리뷰 작성",
    path: "reviews",
    withItems: "이 회사에서 일한 경험이 있다면 리뷰를 남겨보세요.",
    empty: "아직 등록된 기업 리뷰가 없어요 · 첫 리뷰를 남겨보세요",
  },
  interview: {
    label: "면접 후기 작성",
    path: "interviews",
    withItems: "면접 경험을 공유해 다른 지원자에게 도움을 주세요.",
    empty: "아직 등록된 면접 후기가 없어요 · 첫 후기를 남겨보세요",
  },
};

/** [companyId]/reviews, [companyId]/interviews 목록이 공유하는 단일 작성 진입 카드 — 그리드 맨 앞 셀에 항상 렌더한다.
 *
 * 카드 골격(패딩·정렬·버튼 폭)은 InterviewAccessStatusCard와 같은 한 벌이다 — 개요 ≤760px에서 두 카드가
 * 같은 자리(섹션 첫 슬롯)에 위아래로 이어져 서는데, 한쪽만 가운데 기둥이면 같은 역할의 카드 둘이 다른
 * 문법으로 읽힌다. 기준은 그쪽이다(폭 분기 없는 한 벌 레이아웃). */
export function CompanyReviewWriteCard({ companyId, reviewType, isLoggedIn, hasItems }: CompanyReviewWriteCardProps) {
  const copy = writeCopy[reviewType];
  const href = isLoggedIn ? `/companies/${companyId}/${copy.path}/new` : "/companies";
  const label = isLoggedIn ? copy.label : "로그인하기";
  const message = hasItems ? copy.withItems : copy.empty;

  return (
    <article className="flex h-full min-h-[160px] flex-col items-stretch justify-start gap-4 border border-border bg-white px-4 pb-4 pt-3 text-center">
      <p className="text-[15px] font-medium leading-[1.6] text-[#596373]">{message}</p>
      {/* gradient는 화면당 1개 규칙(Button.tsx) — 이 카드는 면접 후기 열람권 카드(hasCredits 시 gradient)와
          한 화면에 공존하므로 primary를 쓴다. w-full은 그 카드의 버튼 기둥과 같은 폭 문법이다. */}
      <LinkButton href={href} variant="primary" size="sm" className="w-full">
        {label}
      </LinkButton>
    </article>
  );
}
