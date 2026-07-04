"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";

interface CompanyInterviewsListClientProps {
  companyId: string;
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
}

/** 허브의 InterviewsFeedClient와 동일한 guest/reviewer 게이팅 CTA 동작을 개별 기업 페이지에서도 재현한다 */
export function CompanyInterviewsListClient({ companyId, items, isLoggedIn }: CompanyInterviewsListClientProps) {
  const router = useRouter();
  const writeHref = `/companies/${companyId}/interviews/new`;

  const handleRequestWriteReview = () => {
    router.push(writeHref);
  };

  if (!items.length) {
    return (
      <div className="mt-6 flex h-[140px] flex-col items-center justify-center gap-1.5 border border-[#e1e8ef] bg-[#fbfcfd] text-center">
        <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 면접 후기가 없습니다.</p>
        <p className="text-[13px] font-normal text-[#8791a0]">새로운 리뷰가 등록되면 이 페이지에서 확인할 수 있습니다.</p>
        {isLoggedIn ? (
          <Link
            href={writeHref}
            className="mt-1 inline-flex h-9 items-center px-4 text-[12px] font-medium text-white transition hover:brightness-110 active:brightness-90"
            style={{ backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 3px rgba(5,60,55,0.28)" }}
          >
            면접 후기 작성하기
          </Link>
        ) : (
          <Link href="/companies" className="mt-1 inline-flex h-9 items-center border border-[#111111] px-4 text-[12px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white">
            로그인하기
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
      {items.map((item) => (
        <CompanyReviewCard
          key={item.id}
          review={item}
          lockedMessage={
            isLoggedIn
              ? "면접 후기를 작성하면 다른 사용자의 상세 후기를 확인할 수 있습니다."
              : "로그인 후 면접 후기 열람 조건을 확인할 수 있습니다."
          }
          lockedCtaLabel={isLoggedIn ? "면접 후기 작성하기" : "로그인하기"}
          lockedCtaHref={isLoggedIn ? undefined : "/companies"}
          lockedCtaVariant={isLoggedIn ? "gradient" : "outline"}
          onLockedCtaClick={isLoggedIn ? handleRequestWriteReview : undefined}
        />
      ))}
    </div>
  );
}
