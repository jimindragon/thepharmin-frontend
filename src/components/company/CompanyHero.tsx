"use client";

import { useState } from "react";
import { Heart, Share2, ShieldCheck } from "lucide-react";
import type { CompanyProfile } from "@/data/companyProfiles";

/** 기업 상세 hero(기업 이미지·로고·기업명·뱃지·관심기업 버튼). [companyId]/layout.tsx가 모든 탭 페이지에서 공유한다 */
export function CompanyHero({ profile }: { profile: CompanyProfile }) {
  const [interested, setInterested] = useState(false);
  const [shared, setShared] = useState(false);

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
        <span className="inline-flex h-7 items-center bg-[#111111]/80 px-3 text-[11px] font-medium text-[#e5d27b] ring-1 ring-white/12">{profile.premiumLabel}</span>
        <div className="mt-7 flex items-end justify-between gap-6 max-[820px]:items-start max-[820px]:flex-col">
          <div className="flex min-w-0 items-center gap-6 max-[640px]:items-start max-[640px]:gap-4">
            <div className="grid h-[118px] w-[118px] shrink-0 place-items-center border border-white/24 bg-white text-center text-[16px] font-medium leading-tight text-[#17212c] shadow-[0_18px_42px_rgba(0,0,0,0.22)] max-[640px]:h-[92px] max-[640px]:w-[92px] max-[640px]:text-[13px]">
              {profile.logoImage ? <img src={profile.logoImage} alt={`${profile.name} 로고`} className="h-full w-full object-contain p-4" /> : profile.logoText}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[34px] font-bold tracking-[-0.02em] text-white max-[640px]:text-[24px]">{profile.name}</h1>
                <span className="inline-flex h-7 items-center gap-1 border border-[#b8dfdb]/60 bg-white/10 px-2.5 text-[11px] font-medium text-[#dff7f4]">
                  <ShieldCheck size={13} />
                  {profile.verifiedLabel}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-normal text-white/86 max-[640px]:text-[13px]">{profile.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span key={tag} className="inline-flex h-8 items-center bg-white/10 px-3 text-[12px] font-medium text-white/88 ring-1 ring-white/14">
                    {tag}
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
