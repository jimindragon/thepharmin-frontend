"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Eye, PenLine, Sparkles } from "lucide-react";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { CompanyHero } from "@/components/company/CompanyHero";
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
import { readSignupOrgTrack, trackProfilePath } from "@/config/businessSignup";
import {
  getMissingRequiredIndustryOrgFields,
  initialIndustryOrgAdmin,
  initialIndustryOrgProfile,
  readIndustryOrgProfileDraft,
  type OrgTrack,
} from "@/data/businessCompanyProfile";
import {
  getMissingRequiredHospitalFields,
  getMissingRequiredPharmacyFields,
  initialHospitalOrgProfile,
  initialPharmacyOrgProfile,
  readHospitalOrgProfileDraft,
  readPharmacyOrgProfileDraft,
  type HospitalOrgProfile,
  type PharmacyOrgProfile,
} from "@/data/businessOrgProfile";
import { buildHospitalPreview, buildIndustryPreview, buildPharmacyPreview } from "@/data/businessProfilePreview";
import { markBusinessMember } from "@/hooks/useBusinessMember";

/** 데모용 트랙 오버라이드(개발 확인용): ?track=pharmacy | hospital | industry.
 * BusinessOrgProfilePageClient(기관정보 관리)와 동일한 규칙 — 가입 결과보다 쿼리가 우선한다. */
function readTrackOverride(): OrgTrack | null {
  const params = new URLSearchParams(window.location.search);
  const track = params.get("track");
  if (track === "pharmacy" || track === "hospital" || track === "industry") return track;
  return null;
}

interface MissingInfoState {
  count: number;
  firstSectionId: string | null;
}

function PreviewControlBar({ track, missing }: { track: OrgTrack; missing: MissingInfoState }) {
  const editHref = trackProfilePath[track];
  const fillHref = missing.firstSectionId ? `${editHref}#${missing.firstSectionId}` : editHref;

  return (
    <div className="sticky top-[64px] z-40 border-b border-[#dfe4ea] bg-[#f7f8fa]">
      <div className="app-shell flex flex-wrap items-center justify-between gap-3 py-3 max-[640px]:flex-col max-[640px]:items-start">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#4f5967]">
          <Eye size={15} className="shrink-0 text-[#7b8491]" />
          구직자에게 보이는 화면입니다
          <span className="text-[12px] font-normal text-[#9aa3af]">이 안내 바는 구직자에게는 노출되지 않습니다</span>
        </div>
        <div className="flex items-center gap-3 max-[640px]:w-full max-[640px]:flex-col">
          {missing.count > 0 ? (
            <Link
              href={fillHref}
              className="inline-flex h-10 items-center justify-center gap-1.5 border border-[#17a68c] bg-[#eafaf5] px-3.5 text-[12.5px] font-medium text-[#0d7369] transition hover:bg-[#dbf5ec] max-[640px]:flex-1"
            >
              <Sparkles size={14} className="shrink-0" />
              부족한 정보 {missing.count}개 채우기
            </Link>
          ) : null}
          <Link
            href={editHref}
            className="inline-flex h-10 items-center justify-center gap-1.5 border border-[#cfd8e3] bg-white px-3.5 text-[12.5px] font-medium text-[#303946] transition hover:border-[#111111] max-[640px]:flex-1"
          >
            <PenLine size={14} className="shrink-0 text-[#7b8491]" />
            기관 정보 수정
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BusinessCompanyPreviewClient() {
  const [track, setTrack] = useState<OrgTrack>(initialIndustryOrgProfile.orgTrack);
  // 산업 트랙 편집 화면(BusinessCompanyProfileClient)이 sessionStorage에 남겨둔 draft. 서버 렌더는 항상
  // initialIndustryOrgProfile로 시작해 SSR과 첫 클라이언트 렌더가 일치하게 하고, draft는 마운트 후에 반영한다.
  const [industryProfile, setIndustryProfile] = useState(initialIndustryOrgProfile);
  // 병원 트랙도 동일한 패턴 — SSR은 initialHospitalOrgProfile로 시작하고 draft는 마운트 후 반영한다.
  const [hospitalProfile, setHospitalProfile] = useState<HospitalOrgProfile>(initialHospitalOrgProfile);
  // 약국 트랙도 동일한 패턴 — SSR은 initialPharmacyOrgProfile로 시작하고 draft는 마운트 후 반영한다.
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyOrgProfile>(initialPharmacyOrgProfile);

  useEffect(() => {
    markBusinessMember();
    const fromSignup = readSignupOrgTrack();
    if (fromSignup) setTrack(fromSignup);
    // ?track= 쿼리 오버라이드는 개발 확인용으로 가입 결과보다 우선한다.
    const override = readTrackOverride();
    if (override) setTrack(override);

    const draft = readIndustryOrgProfileDraft();
    if (draft) setIndustryProfile(draft);

    const hospitalDraft = readHospitalOrgProfileDraft();
    if (hospitalDraft) setHospitalProfile(hospitalDraft);

    const pharmacyDraft = readPharmacyOrgProfileDraft();
    if (pharmacyDraft) setPharmacyProfile(pharmacyDraft);
  }, []);

  const trackLabel = track === "hospital" ? "병원" : track === "pharmacy" ? "약국" : "기업";

  let body: ReactNode;
  let missing: MissingInfoState;

  if (track === "hospital") {
    const { profile, company } = buildHospitalPreview(hospitalProfile);
    const missingFields = getMissingRequiredHospitalFields(hospitalProfile);
    missing = { count: missingFields.length, firstSectionId: missingFields[0]?.sectionId ?? null };
    body = (
      <>
        <CompanyHero profile={profile} />
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
          <div className="grid gap-9">
            <HospitalSummarySection profile={profile} company={company} />
            <CompanyReviewsPreviewSection profile={profile} type="interview" />
            <CompanyReviewsPreviewSection profile={profile} type="company" />
          </div>
          <HospitalAsidePanel profile={profile} />
        </div>
      </>
    );
  } else if (track === "pharmacy") {
    const { profile, company } = buildPharmacyPreview(pharmacyProfile);
    const missingFields = getMissingRequiredPharmacyFields(pharmacyProfile);
    missing = { count: missingFields.length, firstSectionId: missingFields[0]?.sectionId ?? null };
    body = (
      <>
        <CompanyHero profile={profile} />
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
          <div className="grid gap-9">
            <PharmacySummarySection profile={profile} company={company} />
            <CompanyReviewsPreviewSection profile={profile} type="interview" />
            <CompanyReviewsPreviewSection profile={profile} type="company" />
          </div>
          <PharmacyAsidePanel profile={profile} />
        </div>
      </>
    );
  } else {
    // 연구 트랙은 아직 별도 orgTrack이 없어(가입 시 "industry"로 합류, STEP 7에서 분리 예정) 이 분기를 그대로 탄다.
    const profile = buildIndustryPreview(industryProfile, initialIndustryOrgAdmin);
    const missingFields = getMissingRequiredIndustryOrgFields(industryProfile, initialIndustryOrgAdmin);
    missing = { count: missingFields.length, firstSectionId: missingFields[0]?.sectionId ?? null };
    body = (
      <>
        <CompanyHero profile={profile} />
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_318px] items-start gap-6 max-[1120px]:grid-cols-1">
          <div className="grid gap-9">
            <CompanyOverview profile={profile} />
            <CompanyDetailOverview profile={profile} />
            <CompanyReviewsPreviewSection profile={profile} type="interview" />
            <CompanyReviewsPreviewSection profile={profile} type="company" />
          </div>
          <CompanyAsidePanel profile={profile} />
        </div>
      </>
    );
  }

  return (
    <>
      <BusinessHeader />
      {/* 사이드바가 있는 BusinessCenterShell을 쓰지 않는다 — 실제 개인 회원용 상세 컴포넌트(CompanyDetailSections.tsx)는
          .app-shell 전체 폭을 전제로 만들어져 있어, 260px 사이드바까지 낀 좁은 폭에 넣으면 요약 표 컬럼이
          찌그러진다(한글이 글자 단위로 줄바꿈될 만큼). 구직자에게 실제로 보이는 폭 그대로 미리보기하기 위해
          헤더만 공유하고 폭은 개인 회원용 페이지와 동일하게 맞춘다. */}
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] pb-24">
        <PreviewControlBar track={track} missing={missing} />
        <div className="app-shell pt-6">
          <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "기업관리" }, { label: "브랜드 페이지 미리보기" }]} />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">브랜드 페이지 미리보기</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">구직자에게 노출되는 {trackLabel} 상세 페이지를 그대로 확인할 수 있는 읽기 전용 화면입니다.</p>

          {/* 미리보기 본문은 읽기 전용이다 — 관심 버튼·탭 이동·후기 더 보기 등 모든 링크/버튼 클릭을 inert로 막는다.
              개인 회원용 상세 컴포넌트(CompanyDetailSections.tsx)는 수정하지 않고 그대로 재사용한다. */}
          <div className="mt-6" inert>
            {body}
          </div>
        </div>
      </main>
    </>
  );
}
