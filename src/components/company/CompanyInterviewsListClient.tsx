"use client";

import { useRouter } from "next/navigation";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";
import { CompanyReviewWriteCard } from "@/components/company/CompanyReviewWriteCard";

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

  return (
    <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
      <CompanyReviewWriteCard companyId={companyId} reviewType="interview" isLoggedIn={isLoggedIn} hasItems={items.length > 0} />
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
