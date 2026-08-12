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

/**
 * hero 뱃지 줄 — 배지는 무채색 절제 스타일 통일(STEP 3a-2), 반투명 흰 보더 + 흰 텍스트, 강조용 채움색 없음.
 *
 * 폭에 따라 **자리가 달라져** 두 군데서 렌더한다(둘 중 하나는 항상 display:none이라 화면에도, 스크린리더에도
 * 한 벌만 잡힌다). 761px 이상은 로고 오른쪽 텍스트 열 안, 한줄소개 아래 — 종전 그대로다. ≤760px는 로고·제목
 * 행에서 빠져나와 전폭 한 줄로 깔린다: 좁은 화면에서 텍스트 열이 로고 폭(92px)만큼 줄어 배지가 한 줄에
 * 하나씩 세로로 쌓이던 자리다. CSS만으로 옮길 수 없는 이동이다 — 두 자리의 부모가 서로 다르다.
 */
function HeroBadges({ badges, className }: { badges: string[]; className: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <span key={badge} className="inline-flex h-8 items-center border border-white/30 px-3 text-[12px] font-medium text-white">
          {badge}
        </span>
      ))}
    </div>
  );
}

/**
 * 하위 탭(공고·면접 후기·기업 리뷰·뉴스·후기 작성)의 ≤760px 히어로. 커버 이미지·한줄소개·배지·
 * 관심 기업/공유 버튼을 전부 걷고 [로고][기관명]만 남긴 얇은 바다.
 *
 * 이 자리에서 풀 히어로(≤760px 실측 299px)가 하던 일은 "이 기업이 무엇인가"를 처음 소개하는 것인데,
 * 하위 탭에 온 사람은 이미 그 소개를 지나온 뒤다 — 목록을 보러 왔는데 화면 한 판을 다시 소개가 먹는다.
 * 개요=요약 / 하위 탭=전체 목록이라는 역할 분리를 상단에서 먼저 알리는 자리이기도 하다.
 *
 * 배경은 헤더(#050505)가 아니라 풀 히어로와 같은 #081015다 — 접힌 것은 히어로지 헤더가 아니므로
 * 히어로 계열 색을 유지한다. 헤더의 border-b(#151515)가 둘 사이를 이미 갈라 준다.
 * 높이 64px도 헤더와 같은 값이라, 스크롤을 올렸을 때 검정 띠 둘이 같은 리듬으로 겹쳐 선다.
 */
function CompanyHeroCompactBar({ profile }: { profile: CompanyProfile }) {
  return (
    /* 풀 히어로와 같은 풀블리드 계산(-shell-gutter/2 되밀기 + px-6) — 좌우로 회색이 새면 바가 아니라
       카드처럼 읽힌다. 이 바는 ≤760px 전용이라 --shell-gutter는 항상 48px이고 변형이 필요 없다. */
    <div className="-mx-[calc(var(--shell-gutter)/2)] flex h-16 items-center gap-3 bg-[#081015] px-6 text-white min-[761px]:hidden">
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden bg-white px-1 text-center text-[12px] font-medium leading-none text-[#17212c]">
        {/* 옆에 기관명이 글자로 서 있으므로 로고는 장식이다 — alt를 비워 같은 이름이 두 번 읽히지 않게 한다 */}
        {profile.logoImage ? <img src={profile.logoImage} alt="" className="h-full w-full object-contain p-1" /> : profile.logoText}
      </div>
      <p className="min-w-0 truncate text-[17px] font-bold tracking-[-0.02em]">{profile.name}</p>
    </div>
  );
}

/**
 * 기업 상세 hero(기업 이미지·로고·기업명·뱃지·관심 기업 저장 버튼). [companyId]/layout.tsx가 모든 탭
 * 페이지에서 공유한다.
 *
 * variant="full"(기본값)은 종전 렌더 그대로다 — 개요 탭과 기업센터 브랜드 페이지 미리보기
 * (BusinessCompanyPreviewClient)가 인자 없이 부르므로 그쪽 파급은 없다.
 *
 * variant="compact"는 **≤760px에서만** 얇은 바로 갈아입는다. 761px 이상은 두 variant가 같은 화면이다 —
 * PC는 히어로 아래 사이드바·라우트 탭이 이미 위계를 잡고 있어 이 혼선이 없던 영역이라 건드리지 않는다.
 * 폭 분기를 CSS로 두는 이유는 호출부(CompanyDetailHero)가 경로만 알고 뷰포트는 모르기 때문이다 —
 * 배지 줄(HeroBadges)이 두 자리에 렌더되는 것과 같은 방식으로, 둘 중 하나는 항상 display:none이다.
 */
export function CompanyHero({ profile, variant = "full" }: { profile: CompanyProfile; variant?: "full" | "compact" }) {
  const [interested, setInterested] = useState(false);
  const [shared, setShared] = useState(false);
  const badges = institutionHeroBadges(profile) ?? profile.tags;

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

  const fullHero = (
    /* ≤760px 풀블리드 — 본문 섹션 카드와 같은 음수 마진(-shell-gutter/2)으로 셸이 물러난 만큼 되민다.
       FLUSH_SECTION_CLASS를 그대로 쓰지 않는 이유는 좌우 패딩의 위치다: 이 히어로는 배경 이미지·그라디언트가
       절대 배치된 껍데기(section)와 그 위에 뜬 콘텐츠 층(아래 relative z-10 div)이 나뉘어 있어, px는
       section이 아니라 콘텐츠 층이 가져야 한다. 그래서 -mx/border-x-0만 여기서 쓰고 px-6은 그쪽에 둔다.
       사진 노출 면적이 좌우로 늘어나는 만큼 로고 카드(흰 판)와 텍스트 대비는 그라디언트가 그대로 맡는다.

       border-t-0도 같은 이유다. main의 pt는 이미 0이라(d336557) 헤더와 히어로 사이에 남은 것은 여백이 아니라
       이 1px 테두리 한 줄이었다 — 검정 헤더 바로 아래 밝은 선(#d6dde6)이 깔려 실기기에서 "얇은 흰 줄"로 보였다.
       좌우와 마찬가지로 화면 끝까지 닿은 히어로에는 위쪽 경계선이 필요 없다: 위는 헤더가 이미 갈라 준다.
       아래 선은 남긴다 — 어두운 히어로와 그 밑 흰 탭 행(라우트 탭·섹션 앵커)의 경계를 확정하는 자리다. */
    <section className="relative overflow-hidden border border-[#d6dde6] bg-[#081015] text-white shadow-[var(--shadow)] max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:border-x-0 max-[760px]:border-t-0">
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
              <HeroBadges badges={badges} className="mt-4 max-[760px]:hidden" />
            </div>
          </div>
          {/* ≤760px 자리 — 로고·제목 행 다음, 액션 버튼 앞. 부모가 세로 flex(max-[820px]:flex-col)라 전폭을 받는다.
              -mt-2는 부모 gap-6(24px)을 한줄소개와의 간격 16px(=데스크톱 mt-4)로 되돌린다 — 배지는 소개 문구에
              딸린 줄이지, 버튼과 등거리로 떠 있는 별개 블록이 아니다. */}
          <HeroBadges badges={badges} className="-mt-2 w-full min-[761px]:hidden" />
          <div className="flex shrink-0 gap-2 max-[640px]:w-full">
            <button
              type="button"
              onClick={() => setInterested((current) => !current)}
              className="inline-flex h-11 items-center justify-center gap-2 bg-white px-4 text-[13px] font-medium text-[#17212c] transition hover:bg-[#f4f4f4] max-[640px]:flex-1"
              aria-pressed={interested}
              aria-label="관심 기업으로 저장"
            >
              <Bookmark size={16} fill={interested ? "currentColor" : "none"} />
              {/* ≤760px는 "관심 기업"으로 줄인다 — 반쪽 칸(w-full flex-1) 안에서 원문이 두 줄로 접혔다.
                  아이콘(북마크)이 남아 동작은 그대로 읽히고, 옆의 "공유"와 글자 수가 비슷해져 2열이 균형을 잡는다.
                  aria-label로 전체 문구를 남겨 스크린리더가 듣는 이름은 폭과 무관하게 같다. */}
              <span className="max-[760px]:hidden">관심 기업으로 저장</span>
              <span className="min-[761px]:hidden">관심 기업</span>
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

  if (variant === "compact") {
    return (
      <>
        <CompanyHeroCompactBar profile={profile} />
        {/* 761px 이상에서는 compact도 풀 히어로를 그대로 그린다 — PC 렌더는 종전과 완전히 같다.
            래퍼 div 하나가 더 생기지만 히어로의 -mx/px는 ≤760px 전용(그 폭에서는 이쪽이 숨는다)이라
            어느 폭에서도 계산에 끼어들지 않는다. */}
        <div className="max-[760px]:hidden">{fullHero}</div>
      </>
    );
  }

  return fullHero;
}
