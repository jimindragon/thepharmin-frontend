"use client";

import Link from "next/link";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { LinkButton } from "@/components/ui/Button";
import { REVIEW_ACCESS_INFO_LINES, REVIEW_ACCESS_INFO_TITLE } from "@/config/reviewAccessCopy";
import { companyReviews, myUnlockedInterviewReviewsMock, reviewAccessHistoryMock } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";
import type { CompanyReview } from "@/types/jobs";

/** 위 툴팁(REVIEW_ACCESS_INFO_LINES)과 같은 규칙을 표로 편 것이다 — 지급 대상 서술이 두 벌로 갈리지 않게 함께 본다 */
const HOW_TO_EARN_ROWS: { label: string; delta: string }[] = [
  { label: "가입 시", delta: "+2장" },
  { label: "면접 후기·약국 재직 후기 승인 시", delta: "+2장" },
  { label: "후기 열람 시", delta: "-1장" },
];

function interviewTimingLabel(review: CompanyReview) {
  if (review.applyYear && review.applyHalf) return `${review.applyYear}년 ${review.applyHalf} 면접`;
  return `${review.writtenAt} 작성`;
}

/** 보유 열람권 수는 별도 필드로 저장하지 않고 reviewAccessHistoryMock의 delta 합계에서 파생한다 —
 * 두 값이 어긋날 여지를 원천적으로 없앤다. */
export function MyPageReviewCreditsClient() {
  const totalCredits = reviewAccessHistoryMock.reduce((sum, entry) => sum + entry.delta, 0);

  return (
    <MyPageShell>
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "후기 열람권" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">후기 열람권</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        후기 열람권 보유 현황과 사용 내역을 확인할 수 있습니다.
      </p>

      <section className="mt-8 border border-border bg-white">
        <div className="grid grid-cols-1 divide-y divide-[#edf1f5] md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-8 py-7">
            <p className="text-[13px] font-medium text-[#596373]">보유 열람권</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[44px] font-bold leading-none tracking-[-0.02em] text-[#111111]">{totalCredits}장</span>
              <InfoTooltip title={REVIEW_ACCESS_INFO_TITLE} lines={REVIEW_ACCESS_INFO_LINES} />
            </div>
            <p className="mt-1.5 text-[12px] font-normal text-[#9aa3af]">후기 1개 열람 시 1장 사용</p>
          </div>

          <div className="px-8 py-7">
            <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#17202c]">열람권 받는 방법</h2>
            <div className="mt-3 divide-y divide-[#edf1f5]">
              {HOW_TO_EARN_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[13px] font-normal text-[#4f5967]">{row.label}</span>
                  <span className="text-[13px] font-medium text-[#111111]">{row.delta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-7">
            <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#17202c]">다음 열람권 받기</h2>
            <p className="mt-3 text-[13px] font-normal text-[#9aa3af]">후기를 작성하면 열람권을 더 받을 수 있어요</p>
            <Link
              href="/companies"
              className="mt-3 inline-flex items-center justify-center bg-[#111111] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2a2a2a]"
            >
              후기 작성하기
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="border border-border bg-white p-6">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#17202c]">열람권 내역</h2>
          <div className="mt-4 divide-y divide-[#edf1f5] border-t border-[#edf1f5]">
            {reviewAccessHistoryMock.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[68px_minmax(0,1fr)_52px] items-center gap-3 py-3">
                <span className="whitespace-nowrap text-[12px] font-normal text-[#9aa3af]">{entry.date}</span>
                <span className="text-[13px] font-normal text-[#3f4855]">{entry.label}</span>
                <span className="text-right text-[13px] font-medium text-[#3f4855]">{entry.delta > 0 ? `+${entry.delta}장` : `${entry.delta}장`}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-white p-6">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#17202c]">내가 열람한 후기</h2>
          <div className="mt-4 divide-y divide-[#edf1f5] border-t border-[#edf1f5]">
            {myUnlockedInterviewReviewsMock.map((entry) => {
              const review = companyReviews.find((item) => item.id === entry.reviewId);
              const profile = getCompanyProfile(entry.companyId);
              if (!review || !profile) return null;

              return (
                <div key={entry.reviewId} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#3f4855]">
                      {profile.name} · {review.jobRole}
                    </p>
                    <p className="mt-1 text-[12px] font-normal text-[#9aa3af]">{interviewTimingLabel(review)}</p>
                  </div>
                  <LinkButton href={`/companies/${entry.companyId}/interviews`} variant="secondary" size="sm" className="shrink-0">
                    다시 보기
                  </LinkButton>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </MyPageShell>
  );
}
