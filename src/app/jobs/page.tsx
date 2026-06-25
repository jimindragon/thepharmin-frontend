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
import { PageTitle } from "@/components/ui/Typography";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import { siteConfig } from "@/config/site";
import { jobs } from "@/data/jobs";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
import { useFeaturedJobs } from "@/hooks/useFeaturedJobs";
import { getStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type { Job, SortOption, UserJobPreference } from "@/types/jobs";

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") {
      return b.dateOrder - a.dateOrder;
    }

    if (sortOption === "마감임박순") {
      return a.deadlineOrder - b.deadlineOrder;
    }

    return Number(b.isRecommended) - Number(a.isRecommended) || b.dateOrder - a.dateOrder;
  });
}

export default function JobsPage() {
  const [sortOption, setSortOption] = useState<SortOption>("추천순");
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeQuickLink, setActiveQuickLink] = useState("preference");
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(null);

  const filterState = useJobFilters(false);
  const activeTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeTrack];
  const featuredJobs = useFeaturedJobs(activeTrack);

  // 트랙(페이지 분야)이 바뀔 때마다 그 분야의 저장된 관심조건만 불러온다 — 자동으로 적용하지는 않는다.
  useEffect(() => {
    setPreferenceState(getStoredJobPreference(activeTrack));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.filters, sortOption]);

  const filteredJobs = useMemo(() => {
    return filterJobsByFilters(jobs, filterState.filters);
  }, [filterState.filters]);

  const visibleJobs = useMemo(() => {
    const sorted = sortJobs(filteredJobs, sortOption);
    if (sorted.length === 0) return [];

    const pageOffset = ((currentPage - 1) * 8) % sorted.length;
    return [...sorted.slice(pageOffset), ...sorted.slice(0, pageOffset)].slice(0, 8);
  }, [currentPage, filteredJobs, sortOption]);

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
      <main className="pb-9 pt-[18px]">
        <div className="app-shell">
          <PageBreadcrumb items={[{ label: siteConfig.breadcrumb }]} />

          <PageTitle>{siteConfig.pageTitle}</PageTitle>

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
                  <p className="text-[17px] font-semibold text-[#3d4653]">조건에 맞는 공고가 없습니다.</p>
                  <p className="mt-2 text-[13px] font-normal text-[#8791a0]">필터를 줄이거나 검색어를 다시 입력해보세요.</p>
                </div>
              )}

              <Pagination currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>

            <SidebarQuickLinks
              track={activeTrack}
              savedCount={bookmarkedIds.length}
              preference={preference}
              preferenceApplied={filterState.preferenceApplied}
              activeQuickLink={activeQuickLink}
              onQuickLinkClick={setActiveQuickLink}
              onApplyPreference={applyPreference}
              onClearPreferenceFilters={clearPreferenceFilters}
            />
          </div>
        </div>
      </main>
    </>
  );
}
