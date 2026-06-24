"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobListToolbar } from "@/components/JobListToolbar";
import { SearchFilterPanel } from "@/components/SearchFilterPanel";
import { SidebarQuickLinks } from "@/components/SidebarQuickLinks";
import { typeScale } from "@/components/ui/Typography";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import { trackToJobTrack, type HomeTrackFilter } from "@/data/home";
import { jobs } from "@/data/jobs";
import { defaultPreferenceScenario, mockUserPreferences } from "@/data/mockUserPreferences";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
import { getStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type { Job, SortOption, UserJobPreference } from "@/types/jobs";

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") return b.dateOrder - a.dateOrder;
    if (sortOption === "마감임박순") return a.deadlineOrder - b.deadlineOrder;
    return Number(b.isRecommended) - Number(a.isRecommended) || b.dateOrder - a.dateOrder;
  });
}

/**
 * 홈 화면과 산업·연구·병원·약국 분야별 랜딩 페이지가 공유하는 "공고 둘러보기" 섹션.
 * `activeTrack`으로 받은 분야에 맞춰 검색·필터·추천·목록을 구성한다.
 */
export function HomeJobsSection({
  bookmarkedIds,
  onToggleBookmark,
  activeTrack: selectedTrack,
}: {
  bookmarkedIds: number[];
  onToggleBookmark: (jobId: number) => void;
  activeTrack: HomeTrackFilter;
}) {
  const [sortOption, setSortOption] = useState<SortOption>("추천순");
  const [activeQuickLink, setActiveQuickLink] = useState("preference");
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(
    mockUserPreferences[defaultPreferenceScenario],
  );
  const initializedPreference = useRef(false);
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

  const filteredJobs = useMemo(() => filterJobsByFilters(jobs, filterState.filters), [filterState.filters]);
  const visibleJobs = useMemo(() => sortJobs(filteredJobs, sortOption).slice(0, 6), [filteredJobs, sortOption]);
  const moreHref = `/jobs?track=${activeJobTrack}`;

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

  return (
    <section className="mt-20 bg-[#f5f6f7] py-16 max-[760px]:py-10">
      <div className="app-shell">
        <div className="mb-5 flex items-center gap-2">
          <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>공고 둘러보기</h2>
        </div>

        <div className="jobs-layout">
          <div className="jobs-main">
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
    </section>
  );
}
