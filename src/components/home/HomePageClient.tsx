"use client";

import clsx from "clsx";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { CarouselControl } from "@/components/RecommendedJobs";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { typeScale } from "@/components/ui/Typography";
import { companyLogos } from "@/config/companyImages";
import { homeRecommendationJobIds, premiumCompanies, themeCurationCards, type HomeTrackFilter } from "@/data/home";
import { jobs } from "@/data/jobs";
import { recommendedJobs } from "@/data/recommendedJobs";
import { useHorizontalCarousel } from "@/hooks/useHorizontalCarousel";
import type { Job } from "@/types/jobs";

/** 실제 기업 상세 페이지(`/companies/{id}`)가 구현된 기업만 카드 클릭을 허용한다. 나머지는 상세 페이지가 없으므로 비클릭형으로 둔다 */
const premiumCompanyDetailIds = new Set(["yuhan", "samsung-biologics"]);

function PremiumCompanies({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const visibleCompanies = activeTrack === "all" ? premiumCompanies : premiumCompanies.filter((company) => company.track === activeTrack);
  const { containerRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel<HTMLDivElement>();

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>업계를 이끄는 기업</h2>
        <div className="flex items-center gap-3">
          {/* 기업정보 홈 페이지가 아직 없어 연결을 비워둔다 — 추가되면 그 페이지로 다시 연결한다 */}
          <span className="cursor-default text-[13px] font-medium text-[#aaaaaa]">전체보기 ›</span>
          <div className="hidden md:block">
            <CarouselControl
              onPrev={scrollPrev}
              onNext={scrollNext}
              canGoPrev={canScrollPrev}
              canGoNext={canScrollNext}
              prevLabel="이전 기업"
              nextLabel="다음 기업"
            />
          </div>
        </div>
      </div>
      <div ref={containerRef} className="premium-scrollbar overflow-x-auto border border-[#dddddd] bg-white">
        <div className="flex min-w-max">
          {visibleCompanies.map((company) => {
            const logoSrc = companyLogos[company.name];
            const cardClassName = "min-h-[188px] w-[300px] shrink-0 border-r border-[#dddddd] px-7 py-7 transition duration-[180ms] hover:bg-[#f7f7f7] last:border-r-0";
            const cardContent = (
              <>
                {logoSrc ? (
                  <div className="mb-6 grid h-12 w-20 place-items-center border border-[#e2e5e8] bg-white p-1.5">
                    <img src={logoSrc} alt={company.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="mb-6">
                    <EntityLogo name={company.name} logoText={company.logoText} size={48} />
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
              </>
            );

            return premiumCompanyDetailIds.has(company.id) ? (
              <Link key={company.id} href={`/companies/${company.id}`} data-carousel-item className={cardClassName}>
                {cardContent}
              </Link>
            ) : (
              <div key={company.id} data-carousel-item className={cardClassName}>
                {cardContent}
              </div>
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
      <Link href="/business" className="flex items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start">
        <p className="text-[14px] font-normal text-[#666666]">채용을 준비 중인 담당자이신가요?</p>
        <span className="text-[13px] font-medium text-[#111111] hover:underline">더파마 리크루트 채용 솔루션 알아보기 ›</span>
      </Link>
    </section>
  );
}

function ThemeCuration() {
  const { containerRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel<HTMLDivElement>();

  return (
    <section className="mt-16">
      <div className="mb-5 flex items-center justify-between">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>테마별 공고</h2>
        <div className="hidden md:block">
          <CarouselControl
            onPrev={scrollPrev}
            onNext={scrollNext}
            canGoPrev={canScrollPrev}
            canGoNext={canScrollNext}
            prevLabel="이전 테마"
            nextLabel="다음 테마"
          />
        </div>
      </div>
      <div ref={containerRef} className="premium-scrollbar flex gap-4 overflow-x-auto pb-2">
        {themeCurationCards.map((card) => (
          <Link key={card.id} href={card.href} data-carousel-item className="min-w-[254px] overflow-hidden border border-[#e5e5e5] bg-white transition duration-[180ms] hover:border-[#dcdcdc] hover:shadow-[0_4px_16px_rgba(12,18,24,0.05)]">
            <div className="h-[120px] overflow-hidden bg-[#f2f3f4]">
              <img src={card.image} alt="" className="h-full w-full object-cover" />
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
  const logoUrl = job.logoUrl ?? companyLogos[job.company];
  return (
    <article className="group relative z-0 flex h-full min-h-[156px] border border-[#e5e5e5] bg-white transition duration-[180ms] hover:z-10 hover:border-[#dcdcdc] hover:shadow-[0_4px_16px_rgba(12,18,24,0.05)] focus-within:z-10 focus-within:border-[#dcdcdc]">
      <Link
        href={job.slug ? `/jobs/${job.slug}` : "/jobs"}
        className="absolute inset-0 z-10"
        aria-label={`${job.title} 상세 보기`}
      >
        <span className="sr-only">{job.title} 상세 보기</span>
      </Link>
      {/* 로고 영역: 박스 없이 이미지만, 없으면 이니셜 */}
      <div className="flex w-[130px] shrink-0 items-center justify-center px-5">
        {logoUrl ? (
          <img src={logoUrl} alt={job.company} className="max-h-10 w-full object-contain" />
        ) : (
          <span className="text-[13px] font-semibold text-[#596373]">{job.company.slice(0, 2)}</span>
        )}
      </div>
      {/* 세로 구분선 */}
      <div className="w-px shrink-0 self-stretch bg-[#eeeeee]" />
      {/* 정보 영역 */}
      <div className="relative flex min-w-0 flex-1 flex-col px-[22px] pb-[20px] pt-[22px]">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark(job.id);
          }}
          className={clsx("absolute right-[14px] top-[14px] z-20 grid h-8 w-8 place-items-center text-[#b4bac3] hover:text-[#111111]", isBookmarked && "text-[#111111]")}
          aria-label={`${job.title} 저장 ${isBookmarked ? "해제" : "추가"}`}
        >
          <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        <p className="pr-8 text-[12px] font-normal text-[#6b7280]">{job.company}</p>
        <h3 className={clsx(typeScale.cardTitle, "mt-0.5 truncate text-[#111111]")}>{job.title}</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="border border-[#f0f0f0] bg-[#f6f6f6] px-2 py-0.5 text-[12px] font-medium text-[#777f8c]">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            {job.postingSource === "headhunting" ? (
              <span className="bg-[#111111] px-2.5 py-1 text-[11px] font-medium text-white">헤드헌팅</span>
            ) : null}
            <span className="text-[11px] font-medium text-[#6b7481]">
              {job.applyMethod === "간편 지원" ? "간편지원" : "홈페이지 지원"}
            </span>
          </div>
          <strong className="text-[13px] font-medium text-danger">{job.deadlineLabel.replace("마감 ", "")}</strong>
        </div>
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
          <div key={job.id} className="-ml-px -mt-px h-full">
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
          <FeaturedJobsSection jobs={recommendedJobs} />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
      </main>
    </>
  );
}
