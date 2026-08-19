"use client";

import { Pencil } from "lucide-react";
import { ReviewAnonymityNotice } from "@/components/company/ReviewAnonymityNotice";
import { LinkButton } from "@/components/ui/Button";
import { SquareIcon } from "@/components/ui/SquareIcon";

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
 * 카드 골격(패딩·버튼 폭)은 InterviewAccessStatusCard와 같은 한 벌이다 — 개요 ≤760px에서 두 카드가
 * 같은 자리(섹션 첫 슬롯)에 위아래로 이어져 서는데, 한쪽만 가운데 기둥이면 같은 역할의 카드 둘이 다른
 * 문법으로 읽힌다. 기준은 그쪽이다(폭 분기 없는 한 벌 레이아웃). */
export function CompanyReviewWriteCard({ companyId, reviewType, isLoggedIn, hasItems }: CompanyReviewWriteCardProps) {
  const copy = writeCopy[reviewType];
  const href = isLoggedIn ? `/companies/${companyId}/${copy.path}/new` : "/companies";
  const label = isLoggedIn ? copy.label : "로그인하기";
  const message = hasItems ? copy.withItems : copy.empty;

  return (
    /* px-6 — 버튼이 카드 벽에 닿지 않게 좌우를 한 단계 넓힌다. ≤760px에서는 부모
       FLUSH_GRID_CLASS가 같은 값(24px)으로 덮어쓰므로 두 폭이 같은 선에 선다.
       justify-center — 이 카드는 격자 첫 칸이라 h-full로 같은 행의 후기 카드만큼 늘어나는데,
       남는 높이를 한쪽으로 몰면 네 덩어리가 카드 위쪽에 뭉치고 아래가 통째로 빈다.
       모바일 개요 펼침은 풀블리드 1열이라 min-h 잉여(상하 28px)가 섹션 간격과 합산돼 과한 공백으로
       보임 — 모바일만 자연 높이. 데스크톱은 0건 목록에서 min-h가 카드 눌림을 막으므로 유지 */
    <article className="flex h-full min-h-[160px] flex-col items-stretch justify-center gap-4 border border-border bg-white px-6 pb-4 pt-3 text-center max-[760px]:min-h-0">
      {/* 아이콘 → 안내 문구 → 버튼 → 익명 안내. 아이콘만 폭을 늘리지 않아 self-center로 기둥에 세운다 */}
      <SquareIcon icon={Pencil} className="self-center" />
      <p className="text-[15px] font-medium leading-[1.6] text-[#596373]">{message}</p>
      {/* w-full은 열람권 카드의 버튼 기둥과 같은 폭 문법이다 — 두 카드가 같은 자리에서 서로를 대체한다 */}
      <LinkButton href={href} variant="primary" size="sm" className="w-full">
        {label}
      </LinkButton>
      <ReviewAnonymityNotice />
    </article>
  );
}
