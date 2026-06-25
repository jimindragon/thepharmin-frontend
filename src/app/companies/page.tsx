import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { CompaniesHomeClient } from "@/components/companies/CompaniesHomeClient";
import { companies, companyReviews } from "@/data/companies";
import { companyDirectory } from "@/data/companyDirectory";

export const metadata: Metadata = {
  title: "기업정보 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국의 기업·기관 정보와 기업 리뷰, 면접 후기를 확인하세요.",
};

interface CompaniesPageProps {
  searchParams: Promise<{ guest?: string; reviewer?: string }>;
}

/**
 * 개인회원 로그인/면접 후기 작성 상태를 미리 보는 쿼리 파라미터.
 * `?guest=true`는 RecruitmentCalendarClient에서 쓰는 것과 동일한 비로그인 미리보기 패턴이고,
 * `?reviewer=true`는 그 패턴을 면접 후기 작성 완료 상태로 확장한 것이다. 실제 글쓰기 폼이
 * 없으므로 버튼 클릭으로 전환되는 값이 아니라, 두 상태 모두 QA/데모 확인용으로만 쓴다.
 *
 * 면접 후기 원문은 여기 서버에서 권한이 없으면 통째로 제외하고 내려보낸다 — 클라이언트가
 * "잠금 여부"만 받아 CSS로 가리는 방식이 아니라, 원문 자체가 처음부터 전달되지 않는다.
 */
export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const isLoggedIn = params.guest !== "true";
  const hasWrittenInterviewReview = params.reviewer === "true";
  const canReadInterviewReviews = isLoggedIn && hasWrittenInterviewReview;

  const recentInterviewReviews = companyReviews
    .filter((review) => review.type === "interview")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .slice(0, 6)
    .map((review) => {
      const company = companies.find((item) => item.id === review.companyId);
      const directoryEntry = companyDirectory.find((item) => item.id === review.companyId);

      return {
        id: review.id,
        companyId: review.companyId,
        companyName: company?.name ?? "기업",
        track: directoryEntry?.track ?? "industry",
        jobRole: review.jobRole,
        outcome: review.outcome,
        writtenAt: review.writtenAt,
        preview: canReadInterviewReviews ? review.content : null,
      };
    });

  return (
    <>
      <Header />
      <CompaniesHomeClient directory={companyDirectory} recentInterviewReviews={recentInterviewReviews} isLoggedIn={isLoggedIn} />
    </>
  );
}
