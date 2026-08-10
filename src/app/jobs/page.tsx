"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { JobCard } from "@/components/JobCard";
import { JobListToolbar } from "@/components/JobListToolbar";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Pagination } from "@/components/Pagination";
import { RecommendedJobs } from "@/components/RecommendedJobs";
import { SearchFilterPanel } from "@/components/SearchFilterPanel";
import { SidebarQuickLinks } from "@/components/SidebarQuickLinks";
import { InterestPromptGate } from "@/components/onboarding/InterestPromptGate";
import { PageTitle } from "@/components/ui/Typography";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import { siteConfig } from "@/config/site";
import { jobs } from "@/data/jobs";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs";
import { getStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type { Job, SortOption, UserJobPreference } from "@/types/jobs";
import { compareJobsByDeadline, isJobExpired } from "@/utils/dday";

const PAGE_SIZE = 8;

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") {
      return b.dateOrder - a.dateOrder;
    }

    if (sortOption === "마감임박순") {
      return compareJobsByDeadline(a, b);
    }

    return (
      Number(b.isRecommended) - Number(a.isRecommended) ||
      Number(isJobExpired(a)) - Number(isJobExpired(b)) ||
      b.dateOrder - a.dateOrder
    );
  });
}

export default function JobsPage() {
  const [sortOption, setSortOption] = useState<SortOption>("추천순");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);
  const [currentPage, setCurrentPage] = useState(1);
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(null);

  const filterState = useJobFilters(false);
  const activeTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeTrack];
  const featuredJobs = useFeaturedJobs(activeTrack);

  // 트랙(페이지 분야)이 바뀔 때마다 그 분야의 저장된 관심조건만 불러온다 — 자동으로 적용하지는 않는다.
  useEffect(() => {
    setPreferenceState(getStoredJobPreference(activeTrack));
  }, [activeTrack]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.filters, sortOption]);

  const filteredJobs = useMemo(() => {
    return filterJobsByFilters(jobs, filterState.filters);
  }, [filterState.filters]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  // 필터로 목록이 짧아졌는데 currentPage가 아직 뒤 페이지에 남아 있는 경우를 막는다 — 슬라이스와 Pagination이 같은 값을 쓴다.
  const safePage = Math.min(currentPage, totalPages);

  const visibleJobs = useMemo(() => {
    const sorted = sortJobs(filteredJobs, sortOption);
    return sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [safePage, filteredJobs, sortOption]);

  const applyPreference = (nextPreference: UserJobPreference) => {
    setPreferenceState(nextPreference);
    filterState.applyPreference(nextPreference);
  };

  const clearPreferenceFilters = () => {
    filterState.clearPreferenceFilters(preference);
  };

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  return (
    <>
      <Header />
      <InterestPromptGate />
      {/*
        ≤760px h1 상단 여백은 캘린더(app-shell pt-8 = 32px) 기준으로 맞춘다. 데스크톱 18px은 유지.
        배경도 ≤760px에서만 QNA·캘린더와 같은 회색으로 — 탭바로 오가는 화면끼리 바탕이 끊기지 않게 한다.
      */}
      <main className="pb-9 pt-[18px] max-[760px]:min-h-screen max-[760px]:bg-[#f7f8fa] max-[760px]:pt-8">
        <div className="app-shell">
          <PageBreadcrumb items={[{ label: siteConfig.breadcrumb }]} />

          <PageTitle className="max-[760px]:mt-0">{siteConfig.pageTitle}</PageTitle>

          <CategoryTabs activeTrack={activeTrack} onChange={filterState.setTrack} />

          <div className="jobs-layout mt-3.5">
            <div className="jobs-main">
              <SearchFilterPanel
                track={activeTrack}
                config={activeFilterConfig}
                filters={filterState.filters}
                keywordInput={filterState.keywordInput}
                appliedChips={filterState.appliedChips}
                onKeywordInputChange={filterState.setKeywordInput}
                onSubmitKeyword={filterState.submitKeyword}
                onToggleJobCategory={filterState.toggleJobCategory}
                onToggleJobSubcategory={filterState.toggleJobSubcategory}
                onToggleResearchFieldCategory={filterState.toggleResearchFieldCategory}
                onToggleResearchFieldSubcategory={filterState.toggleResearchField}
                onToggleMultiFilter={filterState.toggleMultiFilter}
                onSetSingleFilter={filterState.setSingleFilter}
                onSetSpecialFilter={filterState.setSpecialFilter}
                onRemoveAppliedFilter={filterState.removeAppliedFilter}
                onResetAll={filterState.resetFilters}
              />

              <RecommendedJobs
                jobs={featuredJobs.jobs}
                onPrev={featuredJobs.onPrev}
                onNext={featuredJobs.onNext}
                canGoPrev={featuredJobs.canGoPrev}
                canGoNext={featuredJobs.canGoNext}
              />

              <JobListToolbar
                totalCount={filteredJobs.length}
                sortOption={sortOption}
                onSortChange={setSortOption}
              />

              {visibleJobs.length ? (
                <div className="flex flex-col gap-1.5">
                  {visibleJobs.map((job) => (
                    <JobCard
                      key={`${job.id}-${currentPage}-${sortOption}`}
                      job={job}
                      isBookmarked={bookmarkedIds.includes(job.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              ) : (
                <div className="surface flex h-[164px] flex-col items-center justify-center text-center">
                  <p className="text-[15px] font-medium text-[#303946]">조건에 맞는 공고가 없습니다.</p>
                  <p className="mt-2 text-[13px] font-normal text-[#8791a0]">필터를 줄이거나 검색어를 다시 입력해보세요.</p>
                </div>
              )}

              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <SidebarQuickLinks
              track={activeTrack}
              savedCount={bookmarkedIds.length}
              preference={preference}
              preferenceApplied={filterState.preferenceApplied}
              onApplyPreference={applyPreference}
              onClearPreferenceFilters={clearPreferenceFilters}
            />
          </div>
        </div>
      </main>
    </>
  );
}
