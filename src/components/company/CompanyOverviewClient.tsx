import { SectionAnchorNav } from "@/components/shared/SectionAnchorNav";
import { getCompanyDetailAnchors } from "@/config/companyDetailAnchors";
import { companies } from "@/data/companies";
import { getCompanyDetailCounts, getCompanyTrack } from "@/data/companyDirectory";
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
  /** ≤760px에서 라우트 탭 행이 숨으므로 그 건수를 앵커가 이어받는다(같은 출처를 쓴다) */
  const counts = getCompanyDetailCounts(profile.id);

  if (track === "hospital" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        <div className="grid grid-cols-1 gap-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("hospital", counts)} ariaLabel="기업 정보 섹션 바로가기" />
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
        <div className="grid grid-cols-1 gap-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("pharmacy", counts)} ariaLabel="기업 정보 섹션 바로가기" />
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
        <div className="grid grid-cols-1 gap-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("research", counts)} ariaLabel="기업 정보 섹션 바로가기" />
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
      <div className="grid grid-cols-1 gap-9">
        {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
        <SectionAnchorNav sections={getCompanyDetailAnchors("industry", counts)} ariaLabel="기업 정보 섹션 바로가기" />
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
