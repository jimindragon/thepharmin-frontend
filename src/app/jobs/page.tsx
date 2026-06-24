"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { defaultPreferenceScenario, mockUserPreferences } from "@/data/mockUserPreferences";
import { recommendedJobs } from "@/data/recommendedJobs";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
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
  const [recommendedOffset, setRecommendedOffset] = useState(0);
  const [activeQuickLink, setActiveQuickLink] = useState("preference");
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(
    mockUserPreferences[defaultPreferenceScenario],
  );
  const initializedPreference = useRef(false);

  const filterState = useJobFilters(defaultPreferenceScenario === "applied");
  const activeTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeTrack];

  useEffect(() => {
    if (initializedPreference.current) return;

    const stored = getStoredJobPreference();
    if (stored) {
      setPreferenceState(stored);
      filterState.applyPreference(stored);
      filterState.setPreferenceApplied(true);
      initializedPreference.current = true;
      return;
    }

    if (defaultPreferenceScenario === "applied" && preference) {
      filterState.applyPreference(preference);
      initializedPreference.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.filters, sortOption]);

  const visibleRecommendedJobs = useMemo(() => {
    const trackRecommendedJobs = recommendedJobs.filter((job) => job.track === activeTrack);
    if (trackRecommendedJobs.length === 0) return [];
    return trackRecommendedJobs.map((_, index) => trackRecommendedJobs[(index + recommendedOffset) % trackRecommendedJobs.length]).slice(0, 3);
  }, [activeTrack, recommendedOffset]);

  const filteredJobs = useMemo(() => {
    return filterJobsByFilters(jobs, filterState.filters);
  }, [filterState.filters]);

  const visibleJobs = useMemo(() => {
    const sorted = sortJobs(filteredJobs, sortOption);
    if (sorted.length === 0) return [];

    const pageOffset = ((currentPage - 1) * 8) % sorted.length;
    return [...sorted.slice(pageOffset), ...sorted.slice(0, pageOffset)].slice(0, 8);
  }, [currentPage, filteredJobs, sortOption]);

  const setPreference = (nextPreference: UserJobPreference | null) => {
    setPreferenceState(nextPreference);
    filterState.setPreferenceApplied(false);
  };

  const applyPreference = () => {
    if (!preference) return;
    filterState.applyPreference(preference);
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
                jobs={visibleRecommendedJobs}
                onNext={() => setRecommendedOffset((current) => (current + 1) % recommendedJobs.length)}
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
              savedCount={bookmarkedIds.length}
              preference={preference}
              preferenceApplied={filterState.preferenceApplied}
              activeQuickLink={activeQuickLink}
              onQuickLinkClick={setActiveQuickLink}
              onSetPreference={setPreference}
              onApplyPreference={applyPreference}
              onClearPreferenceFilters={clearPreferenceFilters}
            />
          </div>
        </div>
      </main>
    </>
  );
}
