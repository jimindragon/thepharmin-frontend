import { readPersonalSession } from "@/lib/session.server";
import { SectionAnchorNav } from "@/components/shared/SectionAnchorNav";
import { getCompanyDetailAnchors } from "@/config/companyDetailAnchors";
import { getPharmacyReviewWriteAccess } from "@/config/pharmacistLicenseGate";
import { resolveQnaViewerState, type QnaPreviewSearchParams } from "@/config/qnaAccess";
import { companies } from "@/data/companies";
import { getCompanyDetailCounts, getCompanyTrack } from "@/data/companyDirectory";
import { resolvePharmacyDetail, type PharmacyDetailModel } from "@/data/pharmacyDetail";
import type { CompanyProfile } from "@/data/companyProfiles";
import { PharmacyClaimNotice } from "@/components/company/PharmacyClaimNotice";
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
  /** 프로필이 있는 기업·기관. 약국은 프로필 없이 pharmacy만 올 수 있다 */
  profile?: CompanyProfile;
  /** 등록부에서 조립한 약국 모델. page.tsx가 프로필 없는 약국에 이 값만 넘긴다 */
  pharmacy?: PharmacyDetailModel;
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
export async function CompanyOverviewClient({ profile, pharmacy, searchParams = {} }: CompanyOverviewClientProps) {
  /**
   * 약국 갈래의 단일 재료. 프로필로 들어온 약국도 같은 모델로 맞춰, 등록부 약국과 두 벌의
   * 렌더 경로가 생기지 않게 한다. resolver가 null이면(등록부에 없는 약국 프로필 —
   * 기업센터 미리보기가 만드는 가짜 id가 그렇다) 약국 갈래를 타지 않고 아래 기본 분기로 떨어진다.
   */
  const pharmacyModel = pharmacy ?? (profile && getCompanyTrack(profile.id) === "pharmacy" ? resolvePharmacyDetail(profile.id) : null);
  if (!pharmacyModel && !profile) return null;

  const entityId = profile?.id ?? pharmacyModel!.id;
  const track = getCompanyTrack(entityId);
  const isLoggedIn = await readPersonalSession();
  /** 약국 트랙에서만 의미가 있는 값이라 그 갈래에서만 아래로 내린다 */
  const pharmacyWriteAccess = getPharmacyReviewWriteAccess(await resolveQnaViewerState(searchParams));
  const company = profile ? companies.find((item) => item.id === profile.id) : undefined;
  /** ≤760px에서 라우트 탭 행이 숨으므로 그 건수를 앵커가 이어받는다(같은 출처를 쓴다) */
  const counts = getCompanyDetailCounts(entityId);

  if (profile && track === "hospital" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("hospital", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <HospitalSummarySection profile={profile} company={company} />
          <CompanyActiveJobsPreviewSection companyId={profile.id} />
          <CompanyReviewsPreviewSection companyId={profile.id} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection companyId={profile.id} type="company" isLoggedIn={isLoggedIn} />
        </div>
        <HospitalAsidePanel profile={profile} />
      </div>
    );
  }

  if (pharmacyModel) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("pharmacy", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <PharmacySummarySection pharmacy={pharmacyModel} />
          {/* 약국만 0건에도 섹션이 선다 — 등록부 약국은 공고 0건이 기본이라, 섹션째 사라지면
              그 화면이 채용을 다루는 페이지인지가 읽히지 않는다 */}
          <CompanyActiveJobsPreviewSection companyId={pharmacyModel.id} emptyMessage="현재 진행 중인 채용공고가 없습니다." />
          <CompanyReviewsPreviewSection companyId={pharmacyModel.id} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection
            companyId={pharmacyModel.id}
            type="company"
            isLoggedIn={isLoggedIn}
            pharmacyWriteAccess={pharmacyWriteAccess}
          />
          {/* 아직 주인이 없는 약국에만 선다. 신청이 이미 들어와 있는지는 브라우저 저장소에 있어
              서버가 알 수 없으므로, 그 판정과 렌더를 클라이언트 컴포넌트에 맡긴다 */}
          <PharmacyClaimNotice registryId={pharmacyModel.registry.id} claimStatus={pharmacyModel.claimStatus} />
        </div>
        <PharmacyAsidePanel pharmacy={pharmacyModel} />
      </div>
    );
  }

  if (profile && track === "research" && company) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
        {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다. 여기 간격은 마진이 아니라 그리드
            gap이라 경쟁할 선언이 없고, 앵커에 같은 크기의 음수 margin-bottom을 주면 다음 행이 그만큼
            당겨져 그 한 자리만 0이 된다. 섹션 사이 36px 리듬은 그대로다. */}
        <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
          {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
          <SectionAnchorNav sections={getCompanyDetailAnchors("research", counts)} ariaLabel="기업 정보 섹션 바로가기" />
          <ResearchSummarySection profile={profile} />
          <CompanyActiveJobsPreviewSection companyId={profile.id} />
          <CompanyReviewsPreviewSection companyId={profile.id} type="interview" isLoggedIn={isLoggedIn} />
          <CompanyReviewsPreviewSection companyId={profile.id} type="company" isLoggedIn={isLoggedIn} />
        </div>
        <ResearchAsidePanel profile={profile} />
      </div>
    );
  }

  /* 위 세 갈래를 모두 지나왔다면 남은 것은 프로필 기반 산업·CRO다 — pharmacyModel만 있고
     프로필이 없는 경우는 위에서 이미 반환됐다(초입 가드와 약국 갈래가 함께 보장한다). */
  if (!profile) return null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
      {/* [&>nav]:-mb-9 — 앵커 바로 아래 36px(gap-9)만 지운다(위 트랙 분기와 같은 이유) */}
      <div className="grid grid-cols-1 gap-9 [&>nav]:-mb-9">
        {/* ≤760px 섹션 앵커 — 히어로·탭 아래, 본문 시작 직전. 옵셔널 섹션 필터링은 컴포넌트가 한다 */}
        <SectionAnchorNav sections={getCompanyDetailAnchors("industry", counts)} ariaLabel="기업 정보 섹션 바로가기" />
        <CompanyOverview profile={profile} />
        <CompanyDetailOverview profile={profile} />
        <CompanyActiveJobsPreviewSection companyId={profile.id} />
        <CompanyReviewsPreviewSection companyId={profile.id} type="interview" isLoggedIn={isLoggedIn} />
        <CompanyReviewsPreviewSection companyId={profile.id} type="company" isLoggedIn={isLoggedIn} />
        <CompanyNewsPreviewSection profile={profile} />
      </div>
      <CompanyAsidePanel profile={profile} />
    </div>
  );
}
