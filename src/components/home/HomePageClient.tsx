"use client";

import clsx from "clsx";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { JobListToolbar } from "@/components/JobListToolbar";
import { RecommendedJobs } from "@/components/RecommendedJobs";
import { SearchFilterPanel } from "@/components/SearchFilterPanel";
import { LinkButton } from "@/components/ui/Button";
import { typeScale } from "@/components/ui/Typography";
import { companyLogos } from "@/config/companyImages";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import {
  homeHeroSlides,
  homeRecommendationJobIds,
  homeTrackTabs,
  premiumCompanies,
  themeCurationCards,
  type HomeTrackFilter,
} from "@/data/home";
import { jobs } from "@/data/jobs";
import { recommendedJobs } from "@/data/recommendedJobs";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
import type { Job, JobTrack, SortOption } from "@/types/jobs";

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") return b.dateOrder - a.dateOrder;
    if (sortOption === "마감임박순") return a.deadlineOrder - b.deadlineOrder;
    return Number(b.isRecommended) - Number(a.isRecommended) || b.dateOrder - a.dateOrder;
  });
}

function trackToJobTrack(track: HomeTrackFilter): JobTrack {
  return track === "all" ? "industry" : track;
}

function HomeTrackBar({
  activeTrack,
  onChange,
}: {
  activeTrack: HomeTrackFilter;
  onChange: (track: HomeTrackFilter) => void;
}) {
  return (
    <section className="sticky top-[64px] z-30 border-b border-[#e5e7eb] bg-white/95 shadow-[0_6px_18px_rgba(17,24,39,0.05)] backdrop-blur">
      <div className="app-shell flex h-[72px] items-center gap-5 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-5 pr-1">
          <span className="whitespace-nowrap text-[14px] font-medium text-[#1f242b]">채용 분야</span>
          <span className="h-7 w-px bg-[#d9dde3]" />
        </div>
        <div className="flex items-center gap-2.5">
          {homeTrackTabs.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => onChange(track.id)}
              className={clsx(
                "h-[42px] min-w-[84px] border px-5 text-[14px] font-medium transition-colors",
                activeTrack === track.id
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
              )}
              aria-pressed={activeTrack === track.id}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeHeroBanner({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const visibleSlides = useMemo(() => {
    const filtered = activeTrack === "all" ? homeHeroSlides : homeHeroSlides.filter((slide) => slide.track === activeTrack);
    return filtered.length ? filtered : homeHeroSlides;
  }, [activeTrack]);
  const activeSlide = visibleSlides[slideIndex % visibleSlides.length];

  const moveSlide = (amount: number) => {
    setSlideIndex((current) => (current + amount + visibleSlides.length) % visibleSlides.length);
  };

  return (
    <section className="pt-7">
      <div className="relative h-[352px] overflow-hidden bg-[linear-gradient(102deg,#080d18_0%,#151d28_46%,#6f7880_100%)] text-white max-[760px]:h-[320px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_44%,rgba(176,190,205,0.22)_0%,rgba(176,190,205,0.12)_26%,transparent_48%)]" />
        <div className="absolute inset-y-0 left-0 w-[58%] bg-[linear-gradient(90deg,rgba(5,9,17,0.82)_0%,rgba(5,9,17,0.42)_72%,transparent_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[48%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_100%)]" />

        <div className="relative z-10 flex h-full flex-col px-12 pb-9 pt-[68px] max-[760px]:px-6 max-[760px]:pt-12">
          <h1 className="max-w-[820px] text-[36px] font-bold leading-[1.25] tracking-[-0.02em] text-white/95 max-[760px]:text-[24px]">
            {activeSlide.title}
          </h1>
          <p className="mt-5 text-[15px] font-normal leading-7 text-white/72">
            {activeSlide.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <LinkButton href={activeSlide.href} variant="gradient" size="lg">
              {activeSlide.positionCount}
            </LinkButton>
            <span className="text-[13px] font-normal text-white/58">{activeSlide.deadline}</span>
          </div>
          <div className="mt-auto flex items-center gap-2">
            {visibleSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={clsx("h-1.5 transition-all", index === slideIndex % visibleSlides.length ? "w-7 bg-white" : "w-1.5 bg-white/38")}
                onClick={() => setSlideIndex(index)}
                aria-label={`${index + 1}번째 배너 보기`}
              />
            ))}
            <span className="ml-4 text-[13px] font-normal text-white/58">
              {(slideIndex % visibleSlides.length) + 1} / {visibleSlides.length}
            </span>
          </div>
        </div>

        <div className="absolute bottom-9 right-8 z-10 flex gap-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center bg-white/14 text-white transition hover:bg-white/24"
            onClick={() => moveSlide(-1)}
            aria-label="이전 배너"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center bg-white/14 text-white transition hover:bg-white/24"
            onClick={() => moveSlide(1)}
            aria-label="다음 배너"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}

function PremiumCompanies({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const visibleCompanies = activeTrack === "all" ? premiumCompanies : premiumCompanies.filter((company) => company.track === activeTrack);

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>프리미엄 대표기업</h2>
        <Link href="/jobs" className="text-[13px] font-medium text-[#777777] hover:text-[#111111]">
          전체보기 ›
        </Link>
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
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>다양한 테마의 공고</h2>
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
        {themeCurationCards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group min-w-[254px] overflow-hidden border border-[#dddddd] bg-white transition hover:border-[#111111]"
          >
            <div className="h-[120px] overflow-hidden bg-[#f2f3f4]">
              <img src={card.image} alt="" className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
            </div>
            <div className="px-5 py-4">
              <h3 className={clsx(typeScale.cardTitle, "truncate text-[#222222]")}>{card.title}</h3>
              <p className="mt-2 text-[12px] font-normal text-[#8a8a8a]">{card.subtitle}</p>
            </div>
          </Link>
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
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>맞춤 추천 채용</h2>
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

function HomeJobsSection({
  bookmarkedIds,
  onToggleBookmark,
  activeTrack: selectedTrack,
}: {
  bookmarkedIds: number[];
  onToggleBookmark: (jobId: number) => void;
  activeTrack: HomeTrackFilter;
}) {
  const [sortOption, setSortOption] = useState<SortOption>("추천순");
  const [recommendedOffset, setRecommendedOffset] = useState(0);
  const filterState = useJobFilters(false, { syncUrl: false });
  const activeJobTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeJobTrack];

  useEffect(() => {
    const nextTrack = trackToJobTrack(selectedTrack);
    if (filterState.filters.track !== nextTrack) {
      filterState.setTrack(nextTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack, filterState.filters.track]);

  const visibleRecommendedJobs = useMemo(() => {
    const trackRecommendedJobs = recommendedJobs.filter((job) => job.track === activeJobTrack);
    if (trackRecommendedJobs.length === 0) return [];
    return trackRecommendedJobs.map((_, index) => trackRecommendedJobs[(index + recommendedOffset) % trackRecommendedJobs.length]).slice(0, 3);
  }, [activeJobTrack, recommendedOffset]);

  const filteredJobs = useMemo(() => filterJobsByFilters(jobs, filterState.filters), [filterState.filters]);
  const visibleJobs = useMemo(() => sortJobs(filteredJobs, sortOption).slice(0, 6), [filteredJobs, sortOption]);
  const moreHref = `/jobs?track=${activeJobTrack}`;

  return (
    <section className="mt-20 bg-[#f5f6f7] py-16 max-[760px]:py-10">
      <div className="app-shell">
        <div className="mb-5 flex items-center gap-2">
          <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>공고 탐색하기</h2>
        </div>

        <SearchFilterPanel
          track={activeJobTrack}
          config={activeFilterConfig}
          filters={filterState.filters}
          keywordInput={filterState.keywordInput}
          appliedChips={filterState.appliedChips}
          onKeywordInputChange={filterState.setKeywordInput}
          onSubmitKeyword={filterState.submitKeyword}
          onToggleJobCategory={filterState.toggleJobCategory}
          onToggleJobSubcategory={filterState.toggleJobSubcategory}
          onToggleMultiFilter={filterState.toggleMultiFilter}
          onSetSingleFilter={filterState.setSingleFilter}
          onSetSpecialFilter={filterState.setSpecialFilter}
          onRemoveAppliedFilter={filterState.removeAppliedFilter}
          onResetAll={filterState.resetFilters}
        />

        <RecommendedJobs
          jobs={visibleRecommendedJobs}
          onNext={() => setRecommendedOffset((current) => (current + 1) % Math.max(1, recommendedJobs.length))}
        />

        <JobListToolbar
          totalCount={filteredJobs.length}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        <div className="flex flex-col gap-1.5">
          {visibleJobs.map((job) => (
            <JobCard key={`home-${job.id}-${sortOption}`} job={job} isBookmarked={bookmarkedIds.includes(job.id)} onToggleBookmark={onToggleBookmark} />
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Link href={moreHref} className="inline-flex h-11 min-w-[160px] items-center justify-center border border-[#d8dce2] bg-white px-7 text-[14px] font-medium text-[#3b4450] hover:border-[#111111] hover:text-[#111111]">
            공고 더 보기
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomePageClient() {
  const [activeTrack, setActiveTrack] = useState<HomeTrackFilter>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);

  const handleTrackChange = (track: HomeTrackFilter) => {
    setActiveTrack(track);
  };

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  };

  return (
    <>
      <Header />
      <HomeTrackBar activeTrack={activeTrack} onChange={handleTrackChange} />
      <main className="pb-0">
        <div className="app-shell">
          <HomeHeroBanner activeTrack={activeTrack} />
          <PremiumCompanies activeTrack={activeTrack} />
          <RecruiterSolutionBanner />
          <ThemeCuration />
          <PersonalRecommendationSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
      </main>
    </>
  );
}
