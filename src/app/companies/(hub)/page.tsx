import type { Metadata } from "next";
import { CompaniesHomeClient } from "@/components/companies/CompaniesHomeClient";
import { companies, companyReviews } from "@/data/companies";
import { companyDirectory } from "@/data/companyDirectory";

export const metadata: Metadata = {
  title: "기업 인사이트 | THE PHARMA Recruit.",
  description: "산업·연구·병원·약국의 기업·기관 정보와 현직자 리뷰, 면접 후기를 확인하세요.",
};

export default function CompaniesPage() {
  /**
   * "최근 올라온 이야기" 피드: 타입별로 최신순 상위 7건씩 따로 내려보낸다 — 클라이언트가
   * "전체" 탭에서는 기업 리뷰 4 + 면접 후기 3으로 섞고, 타입 탭에서는 해당 타입 7건을 그대로 쓴다.
   * 면접 후기는 이 피드에서 원문을 절대 보여주지 않으므로 content 자체를 내려보내지 않고
   * tags만 슬림하게 담는다 — /companies 메인의 기존 개요 미리보기와 동일한 원칙.
   */
  function toCompanyName(companyId: string) {
    return companies.find((item) => item.id === companyId)?.name ?? "기업";
  }

  const companyFeedItems = companyReviews
    .filter((review) => review.type === "company")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .slice(0, 7)
    .map((review) => ({
      id: review.id,
      companyId: review.companyId,
      companyName: toCompanyName(review.companyId),
      type: "company" as const,
      jobRole: review.jobRole,
      writtenAt: review.writtenAt,
      content: review.content,
      helpfulCount: review.helpfulCount,
    }));

  const interviewFeedItems = companyReviews
    .filter((review) => review.type === "interview")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .slice(0, 7)
    .map((review) => ({
      id: review.id,
      companyId: review.companyId,
      companyName: toCompanyName(review.companyId),
      type: "interview" as const,
      jobRole: review.jobRole,
      writtenAt: review.writtenAt,
      tags: review.tags,
    }));

  return (
    <CompaniesHomeClient
      directory={companyDirectory}
      companyFeedItems={companyFeedItems}
      interviewFeedItems={interviewFeedItems}
    />
  );
}
