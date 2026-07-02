import type { Metadata } from "next";
import { InterviewsFeedClient } from "@/components/companies/InterviewsFeedClient";
import { companies, companyReviews } from "@/data/companies";

export const metadata: Metadata = {
  title: "면접 후기 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국 전체 기업의 면접 후기를 모아 확인하세요.",
};

interface CompaniesInterviewsPageProps {
  searchParams: Promise<{ guest?: string; reviewer?: string }>;
}

/** /companies 허브와 동일한 guest/reviewer 쿼리파라미터 게이팅 규칙을 그대로 적용한다 */
export default async function CompaniesInterviewsPage({ searchParams }: CompaniesInterviewsPageProps) {
  const params = await searchParams;
  const isLoggedIn = params.guest !== "true";
  const hasWrittenInterviewReview = params.reviewer === "true";
  const canReadInterviewReviews = isLoggedIn && hasWrittenInterviewReview;

  const items = companyReviews
    .filter((review) => review.type === "interview")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map((review) => {
      const company = companies.find((item) => item.id === review.companyId);

      return {
        id: review.id,
        companyId: review.companyId,
        companyName: company?.name ?? "기업",
        jobRole: review.jobRole,
        writtenAt: review.writtenAt,
        tags: review.tags,
        outcome: review.outcome,
        preview: canReadInterviewReviews ? review.content : null,
      };
    });

  return <InterviewsFeedClient items={items} isLoggedIn={isLoggedIn} />;
}
