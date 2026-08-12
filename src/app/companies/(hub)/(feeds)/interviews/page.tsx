import type { Metadata } from "next";
import Link from "next/link";
import { InterviewsFeedClient } from "@/components/companies/InterviewsFeedClient";
import { companies, companyReviews } from "@/data/companies";
import { readPersonalSession } from "@/lib/session.server";

export const metadata: Metadata = {
  title: "면접 후기 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국 전체 기업의 면접 후기를 모아 확인하세요.",
};

interface CompaniesInterviewsPageProps {
  searchParams: Promise<{ reviewer?: string }>;
}

/** 로그인 여부는 개인 세션 쿠키로 판정하고, "면접 후기를 이미 작성했는가"는 실제 회원 필드가 없어
 * 여전히 ?reviewer=true 미리보기 파라미터로 둔다 — 두 축은 서로 독립이다. */
export default async function CompaniesInterviewsPage({ searchParams }: CompaniesInterviewsPageProps) {
  const params = await searchParams;
  const isLoggedIn = await readPersonalSession();
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
        applyYear: review.applyYear,
        applyHalf: review.applyHalf,
        preview: canReadInterviewReviews ? review.content : null,
      };
    });

  return (
    <>
      <Link href="/companies" className="mt-8 inline-flex items-center text-[13px] font-medium text-[#596373] transition hover:text-[#111111]">
        ← 기업 인사이트
      </Link>
      <InterviewsFeedClient items={items} isLoggedIn={isLoggedIn} />
    </>
  );
}
