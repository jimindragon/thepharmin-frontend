import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyInterviewsListClient } from "@/components/company/CompanyInterviewsListClient";
import { companyReviews } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";
import { readPersonalSession } from "@/lib/session.server";

interface CompanyInterviewsPageProps {
  params: Promise<{ companyId: string }>;
}

export const metadata: Metadata = {
  title: "면접 후기 | THE PHARMA Recruit.",
};

/** 열람권(credit) 게이팅은 클라이언트(CompanyInterviewsListClient)의 데모 상태가 담당한다 — 이 페이지는
 * content를 null 처리하지 않고 항상 원문을 내려보낸다. 개인 세션 쿠키는 그 데모 상태의 초기값
 * (비로그인 진입인지)만 정하는 데 쓰인다. */
export default async function CompanyInterviewsPage({ params }: CompanyInterviewsPageProps) {
  const { companyId } = await params;
  const isLoggedIn = await readPersonalSession();

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
