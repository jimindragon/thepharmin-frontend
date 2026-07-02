import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyJobsPreview, EmptyState } from "@/components/company/CompanyDetailSections";
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

  if (!profile) {
    const company = companies.find((item) => item.id === companyId);
    return (
      <CompanyFallbackShell>
        <EmptyState message={`${company?.name ?? "이 기업"}의 채용공고 상세 페이지는 준비 중입니다.`} />
      </CompanyFallbackShell>
    );
  }

  return (
    <div className="mt-6">
      <CompanyJobsPreview profile={profile} />
    </div>
  );
}
