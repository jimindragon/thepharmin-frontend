"use client";

import { LinkButton } from "@/components/ui/Button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export type InterviewAccessUserState = "loggedOut" | "noCredits" | "hasCredits";

interface InterviewAccessStatusCardProps {
  userState: InterviewAccessUserState;
  credits: number;
  writeHref: string;
}

const ACCESS_INFO_TITLE = "열람권 이용 안내";
const ACCESS_INFO_LINES = [
  "가입 시 열람권 2장 지급",
  "면접 후기 승인 시 2장 추가 지급",
  "후기 1개 열람 시 1장 사용",
  "이미 열람한 후기는 추가 차감 없음",
];

const MANAGE_HREF = "/mypage/review-credits";

/** interviews 목록 그리드 첫 슬롯에서 CompanyReviewWriteCard를 대체하는 열람권 상태 카드.
 * 카드 외형(흰 배경/보더/radius 0/세로 중앙 정렬)은 CompanyReviewWriteCard와 동일한 문법을 따르고,
 * userState 3종에 따라 문구·CTA만 바뀌고 레이아웃은 고정이다. */
export function InterviewAccessStatusCard({ userState, credits, writeHref }: InterviewAccessStatusCardProps) {
  const copy =
    userState === "loggedOut"
      ? {
          label: null as string | null,
          value: null as string | null,
          title: "면접 후기는 로그인 후 볼 수 있어요",
          subtext: "가입 시 무료 열람권 2장 지급",
          primaryLabel: "무료 열람권 받고 시작하기",
          primaryHref: "#",
          primaryCaption: null as string | null,
          secondaryLabel: "로그인",
          secondaryHref: "#",
        }
      : userState === "noCredits"
        ? {
            label: "보유 열람권",
            value: "0장",
            title: null as string | null,
            subtext: "후기를 작성하면 2장 지급",
            primaryLabel: "후기 작성하고 2장 받기",
            primaryHref: writeHref,
            primaryCaption: "작성 승인 시 지급",
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          }
        : {
            label: "보유 열람권",
            value: `${credits}장`,
            title: null as string | null,
            subtext: "후기 1개 열람 시 1장 사용",
            primaryLabel: "면접 후기 작성하기",
            primaryHref: writeHref,
            primaryCaption: "작성 시 열람권 +2장",
            secondaryLabel: "열람권 관리",
            secondaryHref: MANAGE_HREF,
          };

  return (
    <article className="flex h-full min-h-[160px] flex-col items-center justify-center gap-4 border border-border bg-white p-4 text-center">
      <div>
        {copy.label ? (
          <>
            <div className="flex items-center justify-center gap-1">
              <p className="text-[13px] font-medium text-[#596373]">{copy.label}</p>
              <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
            </div>
            <div className="mt-1.5">
              <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[#111111]">{copy.value}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[14px] font-semibold text-[#171b21]">{copy.title}</span>
            <InfoTooltip title={ACCESS_INFO_TITLE} lines={ACCESS_INFO_LINES} />
          </div>
        )}
        <p className="mt-1.5 text-[12px] font-normal text-[#9aa3af]">{copy.subtext}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <LinkButton href={copy.primaryHref} variant={userState === "hasCredits" ? "gradient" : "primary"} size="sm">
            {copy.primaryLabel}
          </LinkButton>
          {copy.primaryCaption ? <span className="text-[12px] font-normal text-[#9aa3af]">{copy.primaryCaption}</span> : null}
        </div>
        <LinkButton href={copy.secondaryHref} variant="secondary" size="sm">
          {copy.secondaryLabel}
        </LinkButton>
      </div>
    </article>
  );
}
