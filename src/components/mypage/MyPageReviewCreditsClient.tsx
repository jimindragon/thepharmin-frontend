"use client";

import Link from "next/link";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { companyReviews, myUnlockedInterviewReviewsMock, reviewAccessHistoryMock } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

const ACCESS_INFO_LINES = [
  "가입 시 열람권 2장이 지급됩니다.",
  "면접 후기 작성 승인 시 열람권 2장이 추가 지급됩니다.",
  "후기 1개 열람 시 열람권 1장이 사용됩니다.",
  "이미 열람한 후기는 추가 차감 없이 다시 볼 수 있습니다.",
];

const HOW_TO_EARN_LINES = ["가입 시 +2장", "면접 후기 작성 승인 시 +2장", "후기 열람 시 -1장"];

/** 보유 열람권 수는 별도 필드로 저장하지 않고 reviewAccessHistoryMock의 delta 합계에서 파생한다 —
 * 두 값이 어긋날 여지를 원천적으로 없앤다. */
export function MyPageReviewCreditsClient() {
  const totalCredits = reviewAccessHistoryMock.reduce((sum, entry) => sum + entry.delta, 0);

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "후기 열람권" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">후기 열람권</h1>
      <p className="mt-2.5 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        면접 후기 열람권 보유 현황과 사용 내역을 확인할 수 있습니다.
      </p>

      <section className="mt-8 border-t border-[#e5e9ef] pt-6">
        <div className="flex items-center gap-2">
          <span className="text-[36px] font-bold leading-none tracking-[-0.02em] text-[#111111]">{totalCredits}장</span>
          <InfoTooltip lines={ACCESS_INFO_LINES} />
        </div>
      </section>

      <section className="mt-8 border-t border-[#e5e9ef] pt-6">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">열람권 받는 방법</h2>
        <ul className="mt-3 space-y-1.5">
          {HOW_TO_EARN_LINES.map((line) => (
            <li key={line} className="text-[13px] font-normal leading-[1.7] text-[#4f5967]">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 border-t border-[#e5e9ef] pt-6">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">열람권 내역</h2>
        <div className="mt-3 divide-y divide-[#edf1f5] border-t border-[#edf1f5]">
          {reviewAccessHistoryMock.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[96px_1fr_44px] items-center gap-3 py-3">
              <span className="text-[12.5px] font-normal text-[#9aa3af]">{entry.date}</span>
              <span className="text-[13px] font-normal text-[#3f4855]">{entry.label}</span>
              <span className="text-right text-[13px] font-medium text-[#3f4855]">{entry.delta > 0 ? `+${entry.delta}` : entry.delta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-[#e5e9ef] pt-6">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">내가 열람한 후기</h2>
        <div className="mt-3 divide-y divide-[#edf1f5] border-t border-[#edf1f5]">
          {myUnlockedInterviewReviewsMock.map((entry) => {
            const review = companyReviews.find((item) => item.id === entry.reviewId);
            const profile = getCompanyProfile(entry.companyId);
            if (!review || !profile) return null;

            return (
              <div key={entry.reviewId} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[13px] font-medium text-[#3f4855]">
                  {profile.name} · {review.jobRole}
                </span>
                <Link
                  href={`/companies/${entry.companyId}/interviews`}
                  className="shrink-0 text-[12.5px] font-medium text-[#596373] transition hover:text-[#111111]"
                >
                  다시 보기
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </MyPageShell>
  );
}
