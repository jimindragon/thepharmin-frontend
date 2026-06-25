"use client";

import clsx from "clsx";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { typeScale } from "@/components/ui/Typography";
import { companyLogos } from "@/config/companyImages";
import { homeRecommendationJobIds, premiumCompanies, themeCurationCards, type HomeTrackFilter } from "@/data/home";
import { jobs } from "@/data/jobs";
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs";
import type { Job } from "@/types/jobs";

function PremiumCompanies({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const visibleCompanies = activeTrack === "all" ? premiumCompanies : premiumCompanies.filter((company) => company.track === activeTrack);

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>업계를 이끄는 기업</h2>
        {/* 기업정보 홈 페이지가 아직 없어 연결을 비워둔다 — 추가되면 그 페이지로 다시 연결한다 */}
        <span className="cursor-default text-[13px] font-medium text-[#aaaaaa]">전체보기 ›</span>
      </div>
      <div className="premium-scrollbar overflow-x-auto border border-[#dddddd] bg-white">
        <div className="flex min-w-max">
          {visibleCompanies.map((company) => {
            const logoSrc = companyLogos[company.name];
            return (
              <Link
                key={company.id}
                href={company.track === "all" ? "/jobs" : `/jobs?track=${company.track}`}
                className="min-h-[188px] w-[330px] shrink-0 border-r border-[#dddddd] px-7 py-7 transition hover:bg-[#fafafa] last:border-r-0"
              >
                {logoSrc ? (
                  <div className="mb-6 grid h-12 w-20 place-items-center border border-[#e2e5e8] bg-white p-1.5">
                    <img src={logoSrc} alt={company.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div
                    className={clsx(
                      "mb-6 grid h-12 w-12 place-items-center border text-[14px] font-semibold",
                      company.logoTone === "plus" ? "border-[#111111] bg-[#111111] text-white" : "border-[#e2e5e8] bg-white text-[#111111]",
                    )}
                  >
                    {company.logoText}
                  </div>
                )}
                <h3 className={clsx(typeScale.cardTitle, "text-[#15191f]")}>{company.name}</h3>
                <p className="mt-3 text-[13px] font-normal leading-6 text-[#777777]">
                  {company.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <p className="mt-5 text-[13px] font-semibold text-[#111111]">{company.positionCount}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecruiterSolutionBanner() {
  return (
    <section className="mt-6 border border-[#e0e0e0] bg-[#fbfbfb] px-6 py-5">
      <Link href="/business/jobs/new" className="flex items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start">
        <p className="text-[14px] font-normal text-[#666666]">채용을 준비 중인 담당자이신가요?</p>
        <span className="text-[13px] font-medium text-[#111111] hover:underline">더파마 리크루트 채용 솔루션 알아보기 ›</span>
      </Link>
    </section>
  );
}

function ThemeCuration() {
  return (
    <section className="mt-16">
      <div className="mb-5 flex items-center justify-between">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>테마별 공고</h2>
        <div className="hidden gap-1 md:flex">
          <button type="button" className="grid h-8 w-8 place-items-center border border-[#d8dce2] text-[#9aa3af]" aria-label="이전 테마">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="grid h-8 w-8 place-items-center border border-[#d8dce2] text-[#333333]" aria-label="다음 테마">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="premium-scrollbar flex gap-4 overflow-x-auto pb-2">
        {/*
          테마별 전용 페이지가 아직 없어 카드 클릭 이동은 비활성화한다. card.href(목적지 데이터)는
          그대로 두고 렌더링만 비클릭형 div로 바꿔, 페이지가 준비되면 다시 Link로 감싸기만 하면 된다.
        */}
        {themeCurationCards.map((card) => (
          <div key={card.id} className="min-w-[254px] cursor-default overflow-hidden border border-[#dddddd] bg-white">
            <div className="h-[120px] overflow-hidden bg-[#f2f3f4]">
              <img src={card.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="px-5 py-4">
              <h3 className={clsx(typeScale.cardTitle, "truncate text-[#222222]")}>{card.title}</h3>
              <p className="mt-2 text-[12px] font-normal text-[#8a8a8a]">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeRecommendationCard({
  job,
  isBookmarked,
  onToggleBookmark,
}: {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
}) {
  return (
    <article className="group relative z-0 grid min-h-[156px] grid-cols-[68px_1fr_auto] gap-4 border border-[#dddddd] bg-white px-5 py-5 transition hover:z-10 hover:border-[#111111] focus-within:z-10 focus-within:border-[#111111]">
      <Link
        href={job.slug ? `/jobs/${job.slug}` : "/jobs"}
        className="absolute inset-0 z-10"
        aria-label={`${job.title} 상세 보기`}
      >
        <span className="sr-only">{job.title} 상세 보기</span>
      </Link>
      <div className="grid h-14 w-14 place-items-center border border-[#e3e6ea] bg-white text-center text-[13px] font-semibold leading-tight text-[#333333]">
        {job.logoText.slice(0, 4)}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-normal text-[#777777]">{job.company}</p>
        <h3 className={clsx(typeScale.cardTitle, "mt-1 truncate text-[#111111]")}>{job.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="bg-[#f3f3f3] px-2.5 py-1 text-[12px] font-medium text-[#555555]">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {job.postingSource === "headhunting" ? <span className="bg-[#111111] px-2.5 py-1 text-[11px] font-medium text-white">헤드헌팅</span> : null}
          <span className="border border-[#dddddd] px-2.5 py-1 text-[11px] font-medium text-[#555555]">
            {job.applyMethod === "간편 지원" ? "간편지원" : "홈페이지 지원"}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark(job.id);
          }}
          className={clsx("relative z-20 grid h-8 w-8 place-items-center text-[#b4bac3] hover:text-[#111111]", isBookmarked && "text-[#111111]")}
          aria-label={`${job.title} 저장 ${isBookmarked ? "해제" : "추가"}`}
        >
          <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        <strong className="text-[15px] font-semibold text-danger">{job.deadlineLabel.replace("마감 ", "")}</strong>
      </div>
    </article>
  );
}

function PersonalRecommendationSection({
  bookmarkedIds,
  onToggleBookmark,
  activeTrack,
}: {
  bookmarkedIds: number[];
  onToggleBookmark: (jobId: number) => void;
  activeTrack: HomeTrackFilter;
}) {
  const visibleJobs = homeRecommendationJobIds
    .map((id) => jobs.find((job) => job.id === id))
    .filter((job): job is Job => Boolean(job))
    .filter((job) => activeTrack === "all" || job.track === activeTrack)
    .slice(0, 4);

  return (
    <section className="mt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>나를 위한 추천 공고</h2>
        <Link href="/jobs" className="text-[13px] font-medium text-[#777777] hover:text-[#111111]">
          전체보기 ›
        </Link>
      </div>
      <div className="grid grid-cols-2 border-l border-t border-[#dddddd] max-[900px]:grid-cols-1">
        {visibleJobs.map((job) => (
          <div key={job.id} className="-ml-px -mt-px">
            <HomeRecommendationCard job={job} isBookmarked={bookmarkedIds.includes(job.id)} onToggleBookmark={onToggleBookmark} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePageClient() {
  const activeTrack: HomeTrackFilter = "all";
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);
  const featuredJobs = useFeaturedJobs(activeTrack);

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  };

  return (
    <>
      <Header />
      <main className="pb-0">
        <div className="app-shell">
          <HomeHeroBanner activeTrack={activeTrack} />
          <PremiumCompanies activeTrack={activeTrack} />
          <RecruiterSolutionBanner />
          <ThemeCuration />
          <PersonalRecommendationSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
          <FeaturedJobsSection
            jobs={featuredJobs.jobs}
            onPrev={featuredJobs.onPrev}
            onNext={featuredJobs.onNext}
            canGoPrev={featuredJobs.canGoPrev}
            canGoNext={featuredJobs.canGoNext}
          />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
      </main>
    </>
  );
}
