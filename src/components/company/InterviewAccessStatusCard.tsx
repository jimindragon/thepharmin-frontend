"use client";

import { LinkButton } from "@/components/ui/Button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export type InterviewAccessUserState = "loggedOut" | "noCredits" | "hasCredits";

interface InterviewAccessStatusCardProps {
  userState: InterviewAccessUserState;
  credits: number;
  writeHref: string;
}

const ACCESS_INFO_LINES = [
  "가입 시 열람권 2장이 지급됩니다.",
  "면접 후기 작성 승인 시 열람권 2장이 추가 지급됩니다.",
  "후기 1개 열람 시 열람권 1장이 사용됩니다.",
  "이미 열람한 후기는 추가 차감 없이 다시 볼 수 있습니다.",
];

const MANAGE_HREF = "/mypage/review-credits";

/** interviews 목록 상단에서 CompanyReviewWriteCard를 대체하는 열람권 상태 배너.
 * userState 3종에 따라 문구·CTA만 바뀌고 레이아웃은 고정이다. */
export function InterviewAccessStatusCard({ userState, credits, writeHref }: InterviewAccessStatusCardProps) {
  const copy =
    userState === "loggedOut"
      ? {
          title: "면접 후기는 로그인 후 볼 수 있어요",
          subtext: "가입 시 무료 열람권 2장 지급",
          primaryLabel: "무료 열람권 받고 시작하기",
          primaryHref: "#",
          secondaryLabel: "로그인",
          secondaryHref: "#",
        }
      : userState === "noCredits"
        ? {
            title: "보유 열람권 0장",
            subtext: "후기를 작성하면 2장 지급",
            primaryLabel: "후기 작성하고 2장 받기",
            primaryHref: writeHref,
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          }
        : {
            title: `보유 열람권 ${credits}장`,
            subtext: "후기 1개 열람 시 1장 사용",
            primaryLabel: "면접 후기 작성하기",
            primaryHref: writeHref,
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          };

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-[#e5e9ef] bg-white px-4 py-3.5">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
          <InfoTooltip lines={ACCESS_INFO_LINES} />
        </div>
        <p className="mt-1 text-[12px] font-normal text-[#68717e]">{copy.subtext}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LinkButton href={copy.primaryHref} variant="primary" size="sm">
          {copy.primaryLabel}
        </LinkButton>
        <LinkButton href={copy.secondaryHref} variant="secondary" size="sm">
          {copy.secondaryLabel}
        </LinkButton>
      </div>
    </div>
  );
}
