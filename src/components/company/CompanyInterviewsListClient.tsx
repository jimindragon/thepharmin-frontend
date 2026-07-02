"use client";

import { useState } from "react";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";

interface CompanyInterviewsListClientProps {
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
}

/** 허브의 InterviewsFeedClient와 동일한 guest/reviewer 게이팅 CTA 동작을 개별 기업 페이지에서도 재현한다 */
export function CompanyInterviewsListClient({ items, isLoggedIn }: CompanyInterviewsListClientProps) {
  const [notice, setNotice] = useState("");

  const handleRequestWriteReview = () => {
    setNotice("면접 후기 작성 화면은 추후 연결될 예정입니다.");
    window.setTimeout(() => setNotice(""), 2400);
  };

  if (!items.length) {
    return (
      <div className="mt-6 flex h-[140px] flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] text-center">
        <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 면접 후기가 없습니다.</p>
        <p className="text-[13px] font-normal text-[#8791a0]">새로운 리뷰가 등록되면 이 페이지에서 확인할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        {items.map((item) => (
          <CompanyReviewCard
            key={item.id}
            review={item}
            typeLabel="면접 후기"
            lockedMessage={
              isLoggedIn
                ? "면접 후기를 작성하면 다른 사용자의 상세 후기를 확인할 수 있습니다."
                : "로그인 후 면접 후기 열람 조건을 확인할 수 있습니다."
            }
            lockedCtaLabel={isLoggedIn ? "면접 후기 작성하기" : "로그인하기"}
            lockedCtaHref={isLoggedIn ? undefined : "/companies"}
            onLockedCtaClick={isLoggedIn ? handleRequestWriteReview : undefined}
          />
        ))}
      </div>
      {notice ? <p className="mt-3 text-[12px] font-medium text-[#596373]">{notice}</p> : null}
    </>
  );
}
