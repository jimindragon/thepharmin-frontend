"use client";

import { useState } from "react";
import { ReviewFeedCard, type ReviewFeedItem } from "@/components/companies/ReviewFeedCard";

export interface InterviewFeedItem extends ReviewFeedItem {
  companyId: string;
}

interface InterviewsFeedClientProps {
  items: InterviewFeedItem[];
  isLoggedIn: boolean;
}

export function InterviewsFeedClient({ items, isLoggedIn }: InterviewsFeedClientProps) {
  const [notice, setNotice] = useState("");

  const handleRequestWriteReview = () => {
    setNotice("면접 후기 작성 화면은 추후 연결될 예정입니다.");
    window.setTimeout(() => setNotice(""), 2400);
  };

  return (
    <section className="mt-8">
      <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">전체 면접 후기</h2>

      {items.length ? (
        <div className="mt-5 grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {items.map((item) => (
            <ReviewFeedCard
              key={item.id}
              review={item}
              href={`/companies/${item.companyId}/interviews`}
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
      ) : (
        <div className="mt-5 flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
          <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 면접 후기가 없습니다.</p>
        </div>
      )}
      {notice ? <p className="mt-3 text-[12px] font-medium text-[#596373]">{notice}</p> : null}
    </section>
  );
}
