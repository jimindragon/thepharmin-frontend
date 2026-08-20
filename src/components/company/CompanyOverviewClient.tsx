import { readPersonalSession } from "@/lib/session.server";
import { SectionAnchorNav } from "@/components/shared/SectionAnchorNav";
import { getCompanyDetailAnchors } from "@/config/companyDetailAnchors";
import { getPharmacyReviewWriteAccess } from "@/config/pharmacistLicenseGate";
import { resolveQnaViewerState, type QnaPreviewSearchParams } from "@/config/qnaAccess";
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
  /**
   * 약사 인증 미리보기 쿼리. ≤760px 기업 리뷰 펼침이 목록 페이지와 같은 작성 유도 카드를 세우므로
   * 같은 게이트를 지나야 한다 — 한쪽에서만 CTA가 남으면 좁은 화면에서 게이트가 뚫린다.
   */
  searchParams?: QnaPreviewSearchParams;
}

/** "기업 개요" 탭(/companies/{id})의 본문. hero/탭 네비는 [companyId]/layout.tsx가 담당한다.
 * 병원·약국 트랙은 N3 개편(요약 카드 통합 + 사이드바 3항목)으로 분기하고, 그 외(산업·CRO)는 기존 레이아웃 그대로다.
 *
 * 개인 세션은 여기서 읽는다 — ≤760px 기업 리뷰 펼침의 첫 슬롯(CompanyReviewWriteCard)이 로그인 여부로 문구·링크를
 * 가르기 때문이다. 목록 페이지(/companies/{id}/reviews)가 같은 카드를 쓰며 같은 것을 읽는 것과 같은 자리이고,
 * 쿠키 읽기가 페이지가 아니라 이 본문에 있는 것은 쓰는 쪽이 여기라서다(page.tsx는 프로필 유무만 가른다). */
export async function CompanyOverviewClient({ profile, searchParams = {} }: CompanyOverviewClientProps) {
  const track = getCompanyTrack(profile.id);
  const isLoggedIn = await readPersonalSession();
  /** 약국 트랙에서만 의미가 있는 값이라 그 갈래에서만 아래로 내린다 */
  const pharmacyWriteAccess = getPharmacyReviewWriteAccess(await resolveQnaViewerState(searchParams));
  const company = companies.find((item) => item.id === profile.id);
  /** ≤760px에서 라우트 탭 행이 숨으므로 그 건수를 앵커가 이어받는다(같은 출처를 쓴다) */
  const counts = getCompanyDetailCounts(profile.id);

  if (track === "hospital" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("hospital", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <HospitalSummarySection profile={profile} company={company} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection profile={profile} type="company" isLoggedIn={isLoggedIn} />
        </div>
        <HospitalAsidePanel profile={profile} />
      </div>
    );
  }

  if (track === "pharmacy" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("pharmacy", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <PharmacySummarySection profile={profile} company={company} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection
            profile={profile}
            type="company"
            isLoggedIn={isLoggedIn}
            pharmacyWriteAccess={pharmacyWriteAccess}
          />
        </div>
        <PharmacyAsidePanel profile={profile} />
      </div>
    );
  }

  if (track === "research" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("research", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <ResearchSummarySection profile={profile} />
          <CompanyActiveJobsPreviewSection profile={profile} />
          <CompanyReviewsPreviewSection profile={profile} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection profile={profile} type="company" isLoggedIn={isLoggedIn} />
        </div>
        <ResearchAsidePanel profile={profile} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
      {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다(위 트랙 분기와 같은 이유) */}
      <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
        {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
        <SectionAnchorNav sections={getCompanyDetailAnchors("industry", counts)} ariaLabel="기업 정보 섹션 바로가기" />
        <CompanyOverview profile={profile} />
        <CompanyDetailOverview profile={profile} />
        <CompanyActiveJobsPreviewSection profile={profile} />
        <CompanyReviewsPreviewSection profile={profile} type="interview" isLoggedIn={isLoggedIn} />
        <CompanyReviewsPreviewSection profile={profile} type="company" isLoggedIn={isLoggedIn} />
        <CompanyNewsPreviewSection profile={profile} />
      </div>
      <CompanyAsidePanel profile={profile} />
    </div>
  );
}
