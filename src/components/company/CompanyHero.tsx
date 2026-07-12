"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";
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

/** 기업 상세 hero(기업 이미지·로고·기업명·뱃지·관심기업 버튼). [companyId]/layout.tsx가 모든 탭 페이지에서 공유한다 */
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
    <section className="relative overflow-hidden border border-[#d6dde6] bg-[#081015] text-white shadow-[var(--shadow)]">
      <img src={profile.coverImage} alt={`${profile.name} 기업 이미지`} className="absolute inset-0 h-full w-full object-cover opacity-42" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,14,0.92)_0%,rgba(3,10,14,0.75)_48%,rgba(3,10,14,0.38)_100%)]" />
      <div className="relative z-10 px-8 py-8 max-[720px]:px-5 max-[720px]:py-6">
        {/* premiumLabel 배지는 STEP 3a-2에서 제거 — Hero는 "식별"(로고·기관명·한줄소개·액션) 역할로 한정한다 */}
        <div className="flex items-end justify-between gap-6 max-[820px]:items-start max-[820px]:flex-col">
          <div className="flex min-w-0 items-center gap-6 max-[640px]:items-start max-[640px]:gap-4">
            <div className="grid h-[118px] w-[118px] shrink-0 place-items-center border border-white/24 bg-white text-center text-[16px] font-medium leading-tight text-[#17212c] shadow-[0_18px_42px_rgba(0,0,0,0.22)] max-[640px]:h-[92px] max-[640px]:w-[92px] max-[640px]:text-[13px]">
              {profile.logoImage ? <img src={profile.logoImage} alt={`${profile.name} 로고`} className="h-full w-full object-contain p-4" /> : profile.logoText}
            </div>
            <div className="min-w-0">
              {/* verified 배지는 STEP 3a에서 전면 제거 — 배지 부여 기준이 없고 공고 등록 자체가 사업자 인증을 전제해 변별력이 없다 */}
              <h1 className="text-[34px] font-bold tracking-[-0.02em] text-white max-[640px]:text-[24px]">{profile.name}</h1>
              <p className="mt-3 text-[15px] font-normal text-white/86 max-[640px]:text-[13px]">{profile.tagline}</p>
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
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/85 bg-white px-4 text-[13px] font-medium text-[#17212c] transition hover:bg-[#f4f4f4] max-[640px]:flex-1"
              aria-pressed={interested}
            >
              <Heart size={16} fill={interested ? "#111111" : "none"} />
              관심기업
            </button>
            <button
              type="button"
              onClick={shareCompany}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/30 bg-white/10 px-4 text-[13px] font-medium text-white transition hover:bg-white/18 max-[640px]:flex-1"
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
