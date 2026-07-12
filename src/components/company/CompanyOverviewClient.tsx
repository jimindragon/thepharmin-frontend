import { companies } from "@/data/companies";
import { getCompanyTrack } from "@/data/companyDirectory";
import type { CompanyProfile } from "@/data/companyProfiles";
import {
  CompanyActiveJobsPreviewSection,
  CompanyAsidePanel,
  CompanyDetailOverview,
  CompanyNewsPreviewSection,
  CompanyOverview,
  CompanyReviewsPreviewSection,
  HospitalAsidePanel,
  HospitalSummarySection,
  PharmacyAsidePanel,
  PharmacySummarySection,
  ResearchAsidePanel,
  ResearchSummarySection,
} from "@/components/company/CompanyDetailSections";

interface CompanyOverviewClientProps {
  profile: CompanyProfile;
}

/** "기업 개요" 탭(/companies/{id})의 본문. hero/탭 네비는 [companyId]/layout.tsx가 담당한다.
 * 병원·약국 트랙은 N3 개편(요약 카드 통합 + 사이드바 3항목)으로 분기하고, 그 외(산업·CRO)는 기존 레이아웃 그대로다. */
export function CompanyOverviewClient({ profile }: CompanyOverviewClientProps) {
  const track = getCompanyTrack(profile.id);
  const company = companies.find((item) => item.id === profile.id);

  if (track === "hospital" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid gap-9">
          <HospitalSummarySection profile={profile} company={company} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" />
          <CompanyReviewsPreviewSection profile={profile} type="company" />
        </div>
        <HospitalAsidePanel profile={profile} />
      </div>
    );
  }

  if (track === "pharmacy" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid gap-9">
          <PharmacySummarySection profile={profile} company={company} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" />
          <CompanyReviewsPreviewSection profile={profile} type="company" />
        </div>
        <PharmacyAsidePanel profile={profile} />
      </div>
    );
  }

  if (track === "research" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid gap-9">
          <ResearchSummarySection profile={profile} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" />
          <CompanyReviewsPreviewSection profile={profile} type="company" />
        </div>
        <ResearchAsidePanel profile={profile} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
      <div className="grid gap-9">
        <CompanyOverview profile={profile} />
        <CompanyDetailOverview profile={profile} />
        <CompanyActiveJobsPreviewSection profile={profile} />
        <CompanyReviewsPreviewSection profile={profile} type="interview" />
        <CompanyReviewsPreviewSection profile={profile} type="company" />
        <CompanyNewsPreviewSection profile={profile} />
      </div>
      <CompanyAsidePanel profile={profile} />
    </div>
  );
}
