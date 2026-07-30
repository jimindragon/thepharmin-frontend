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

/** [companyId]/reviews, [companyId]/interviews 목록이 공유하는 단일 작성 진입 카드 — 그리드 맨 앞 셀에 항상 렌더한다. */
export function CompanyReviewWriteCard({ companyId, reviewType, isLoggedIn, hasItems }: CompanyReviewWriteCardProps) {
  const copy = writeCopy[reviewType];
  const href = isLoggedIn ? `/companies/${companyId}/${copy.path}/new` : "/companies";
  const label = isLoggedIn ? copy.label : "로그인하기";
  const message = hasItems ? copy.withItems : copy.empty;

  return (
    <article className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 border border-border bg-white p-4 text-center">
      <p className="text-[15px] font-medium leading-[1.6] text-[#3f4855]">{message}</p>
      <LinkButton href={href} variant="gradient" size="sm">
        {label}
      </LinkButton>
    </article>
  );
}
