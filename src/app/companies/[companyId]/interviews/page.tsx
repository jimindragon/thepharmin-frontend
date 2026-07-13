import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyInterviewsListClient } from "@/components/company/CompanyInterviewsListClient";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyInterviewsPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ guest?: string }>;
}

export const metadata: Metadata = {
  title: "면접 후기 | THE PHARMA Recruit.",
};

/** 열람권(credit) 게이팅은 클라이언트(CompanyInterviewsListClient)의 데모 상태가 담당한다 — 이 페이지는
 * 더 이상 searchParams로 content를 null 처리하지 않고 항상 원문을 내려보낸다. ?guest=true만 클라이언트의
 * 초기 로그인 상태(데모 진입점)를 정하는 데 쓰이고, 그 밖의 게이팅 파라미터(?reviewer=)는 더 이상 없다. */
export default async function CompanyInterviewsPage({ params, searchParams }: CompanyInterviewsPageProps) {
  const { companyId } = await params;
  const sp = await searchParams;
  const isLoggedIn = sp.guest !== "true";

  const profile = getCompanyProfile(companyId);

  const items = companyReviews
    .filter((review) => review.companyId === companyId && review.type === "interview")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => ({
      id: review.id,
      tags: review.tags,
      content: review.content,
      jobRole: review.jobRole,
      authorStatus: review.authorStatus,
      writtenAt: review.writtenAt,
      helpfulCount: review.helpfulCount,
      interviewDifficulty: review.interviewDifficulty,
      interviewFormat: review.interviewFormat,
      applyYear: review.applyYear,
      applyHalf: review.applyHalf,
      isInterview: true,
      isMine: review.isMine,
    }));

  const body = <CompanyInterviewsListClient companyId={companyId} items={items} isLoggedIn={isLoggedIn} />;

  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
