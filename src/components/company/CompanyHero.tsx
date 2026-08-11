"use client";

import { useState } from "react";
import { Bookmark, Share2 } from "lucide-react";
import { companies } from "@/data/companies";
import { getCompanyTrack, regionFromAddress } from "@/data/companyDirectory";
import type { CompanyProfile } from "@/data/companyProfiles";
import { getHospitalCombinedTypeLabel, getPharmacyTypeLabel } from "@/config/companyTypes";

/** 병원·약국 트랙 hero 뱃지: 기관 유형 콤보 라벨 + 지역, 최대 2개(STEP 3a-2 — 직원 수는 본문 B 카드와 중복돼 제거).
 * 값이 없는 뱃지는 만들지 않는다. "-"는 이 코드베이스에서 미입력을 뜻하는 기존 관례라 빈 값과 동일하게 취급한다 */
function institutionHeroBadges(profile: CompanyProfile): string[] | null {
  const company = companies.find((item) => item.id === profile.id);
  if (!company) return null;

  const track = getCompanyTrack(profile.id);
  const typeLabel =
    track === "hospital" && company.hospitalType && company.hospitalOperator
      ? getHospitalCombinedTypeLabel(company.hospitalType, company.hospitalOperator, company.specialtyLabel)
      : track === "pharmacy" && company.pharmacyType
        ? getPharmacyTypeLabel(company.pharmacyType)
        : // 연구 트랙은 별도 타입 필드가 없다 — companies.ts의 industry가 이미 기관 유형 라벨(예: "정부출연연구기관") 그 자체다
          track === "research"
          ? company.industry
          : null;
  if (!typeLabel) return null;

  const badges = [typeLabel];
  const region = regionFromAddress(company.address);
  if (region) badges.push(region);
  return badges;
}

/** 기업 상세 hero(기업 이미지·로고·기업명·뱃지·관심 기업 저장 버튼). [companyId]/layout.tsx가 모든 탭 페이지에서 공유한다 */
export function CompanyHero({ profile }: { profile: CompanyProfile }) {
  const [interested, setInterested] = useState(false);
  const [shared, setShared] = useState(false);
  const institutionBadges = institutionHeroBadges(profile);

  const shareCompany = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile.name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    /* ≤760px 풀블리드 — 본문 섹션 카드와 같은 음수 마진(-shell-gutter/2)으로 셸이 물러난 만큼 되민다.
       FLUSH_SECTION_CLASS를 그대로 쓰지 않는 이유는 좌우 패딩의 위치다: 이 히어로는 배경 이미지·그라디언트가
       절대 배치된 껍데기(section)와 그 위에 뜬 콘텐츠 층(아래 relative z-10 div)이 나뉘어 있어, px는
       section이 아니라 콘텐츠 층이 가져야 한다. 그래서 -mx/border-x-0만 여기서 쓰고 px-6은 그쪽에 둔다.
       사진 노출 면적이 좌우로 늘어나는 만큼 로고 카드(흰 판)와 텍스트 대비는 그라디언트가 그대로 맡는다. */
    <section className="relative overflow-hidden border border-[#d6dde6] bg-[#081015] text-white shadow-[var(--shadow)] max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:border-x-0">
      <img src={profile.coverImage} alt={`${profile.name} 기업 이미지`} className="absolute inset-0 h-full w-full object-cover opacity-42" />
      {/* 전폭이 되며 우측(밝은 쪽) 이미지가 더 보이므로, ≤760px에서는 그라디언트 끝값을 0.38 → 0.62로 올려
          텍스트가 얹히는 폭 전체에서 어두운 바탕을 유지한다. 761px 이상은 종전 값 그대로다. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,14,0.92)_0%,rgba(3,10,14,0.75)_48%,rgba(3,10,14,0.38)_100%)] max-[760px]:bg-[linear-gradient(90deg,rgba(3,10,14,0.92)_0%,rgba(3,10,14,0.8)_48%,rgba(3,10,14,0.62)_100%)]" />
      {/* 좌우 24px = --shell-gutter/2 — 화면 끝에 닿은 히어로 안의 글이 같은 화면의 섹션 카드·앵커 탭과 같은 선에 선다 */}
      <div className="relative z-10 px-8 py-8 max-[760px]:px-6 max-[760px]:py-6">
        {/* 인증·프리미엄 배지는 변별력 없어 제거됨(공고 등록 자체가 사업자 인증 전제) — Hero는 "식별"(로고·기관명·한줄소개·액션) 역할로 한정한다 */}
        <div className="flex items-end justify-between gap-6 max-[820px]:items-start max-[820px]:flex-col">
          <div className="flex min-w-0 items-center gap-6 max-[640px]:items-start max-[640px]:gap-4">
            <div className="grid h-[118px] w-[118px] shrink-0 place-items-center bg-white text-center text-[16px] font-medium leading-tight text-[#17212c] shadow-[0_18px_42px_rgba(0,0,0,0.22)] max-[640px]:h-[92px] max-[640px]:w-[92px] max-[640px]:text-[13px]">
              {profile.logoImage ? <img src={profile.logoImage} alt={`${profile.name} 로고`} className="h-full w-full object-contain p-4" /> : profile.logoText}
            </div>
            <div className="min-w-0">
              <h1 className="text-[34px] font-bold tracking-[-0.02em] text-white max-[640px]:text-[24px]">{profile.name}</h1>
              <p className="mt-3 text-[15px] font-normal text-white/85 max-[640px]:text-[13px]">{profile.tagline}</p>
              {/* 배지는 무채색 절제 스타일 통일(STEP 3a-2) — 반투명 흰 보더 + 흰 텍스트, 강조용 채움색 없음 */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(institutionBadges ?? profile.tags).map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex h-8 items-center border border-white/30 px-3 text-[12px] font-medium text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2 max-[640px]:w-full">
            <button
              type="button"
              onClick={() => setInterested((current) => !current)}
              className="inline-flex h-11 items-center justify-center gap-2 bg-white px-4 text-[13px] font-medium text-[#17212c] transition hover:bg-[#f4f4f4] max-[640px]:flex-1"
              aria-pressed={interested}
            >
              <Bookmark size={16} fill={interested ? "currentColor" : "none"} />
              관심 기업으로 저장
            </button>
            <button
              type="button"
              onClick={shareCompany}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/30 bg-white/10 px-4 text-[13px] font-medium text-white transition hover:bg-white/20 max-[640px]:flex-1"
            >
              <Share2 size={16} />
              {shared ? "복사됨" : "공유"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
