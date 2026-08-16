import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyJobsPreview, EmptyState } from "@/components/company/CompanyDetailSections";
import { CompanyMobileOverviewRedirect } from "@/components/company/CompanyMobileOverviewRedirect";
import { companyAnchorIds } from "@/config/companyDetailAnchors";
import { companies } from "@/data/companies";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyJobsPageProps {
  params: Promise<{ companyId: string }>;
}

export const metadata: Metadata = {
  title: "채용공고 | THE PHARMA Recruit.",
};

export default async function CompanyJobsPage({ params }: CompanyJobsPageProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);

  /* 프로필이 없는 기업은 개요가 MissingCompany라 돌려보낼 곳이 없다 — 가드를 씌우지 않는다 */
  if (!profile) {
    const company = companies.find((item) => item.id === companyId);
    return (
      <CompanyFallbackShell>
        <EmptyState message={`${company?.name ?? "이 기업"}의 채용공고 상세 페이지는 준비 중입니다.`} />
      </CompanyFallbackShell>
    );
  }

  return (
    <CompanyMobileOverviewRedirect companyId={companyId} anchorId={companyAnchorIds.jobs}>
      <CompanyJobsPreview profile={profile} />
    </CompanyMobileOverviewRedirect>
  );
}
