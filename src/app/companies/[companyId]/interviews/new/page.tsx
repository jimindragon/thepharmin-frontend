import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { ReviewWriteClient } from "@/components/company/ReviewWriteClient";
import { companies } from "@/data/companies";
import { getCompanyTrack } from "@/data/companyDirectory";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyInterviewWritePageProps {
  params: Promise<{ companyId: string }>;
}

export const metadata: Metadata = {
  title: "면접 후기 작성 | THE PHARMA Recruit.",
};

/** 면접 후기 작성 목업 화면. 실제 저장 없이 ReviewWriteClient가 토스트 + 목록 이동만 수행한다. */
export default async function CompanyInterviewWritePage({ params }: CompanyInterviewWritePageProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);
  const company = companies.find((item) => item.id === companyId);
  const track = getCompanyTrack(companyId);

  const body = <ReviewWriteClient companyId={companyId} companyName={company?.name ?? "기업"} track={track} reviewType="interview" />;

  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
