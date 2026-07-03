import { companies } from "@/data/companies";
import { getCompanyTrack } from "@/data/companyDirectory";
import type { CompanyProfile } from "@/data/companyProfiles";
import {
  CompanyAsidePanel,
  CompanyDetailOverview,
  CompanyOverview,
  CompanyReviewsPreviewSection,
  HospitalAsidePanel,
  HospitalSummarySection,
  PharmacyAsidePanel,
  PharmacySummarySection,
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
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid gap-5">
          <HospitalSummarySection profile={profile} company={company} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" />
          <CompanyReviewsPreviewSection profile={profile} type="company" />
        </div>
        <HospitalAsidePanel profile={profile} company={company} />
      </div>
    );
  }

  if (track === "pharmacy" && company) {
    return (
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid gap-5">
          <PharmacySummarySection profile={profile} company={company} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" />
          <CompanyReviewsPreviewSection profile={profile} type="company" />
        </div>
        <PharmacyAsidePanel profile={profile} company={company} />
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6 max-[1120px]:grid-cols-1">
      <div className="grid gap-5">
        <CompanyOverview profile={profile} />
        <CompanyDetailOverview profile={profile} />
        <CompanyReviewsPreviewSection profile={profile} type="interview" />
        <CompanyReviewsPreviewSection profile={profile} type="company" />
      </div>
      <CompanyAsidePanel profile={profile} />
    </div>
  );
}
