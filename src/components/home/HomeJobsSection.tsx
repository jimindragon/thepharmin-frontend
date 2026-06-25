"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobListToolbar } from "@/components/JobListToolbar";
import { Pagination } from "@/components/Pagination";
import { SearchFilterPanel } from "@/components/SearchFilterPanel";
import { SidebarQuickLinks } from "@/components/SidebarQuickLinks";
import { typeScale } from "@/components/ui/Typography";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import { trackToJobTrack, type HomeTrackFilter } from "@/data/home";
import { jobs } from "@/data/jobs";
import { filterJobsByFilters, useJobFilters } from "@/hooks/useJobFilters";
import { getStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type { Job, SortOption, UserJobPreference } from "@/types/jobs";

const PAGE_SIZE = 6;

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
 *
 * 분야(트랙)는 페이지의 기본 범위 조건이라 항상 유지되고, 관심조건은 사용자가 사이드바에서
 * 직접 적용을 선택했을 때만 덧씌워지는 별개의 선택 필터다 — 진입 시 자동으로 적용하지 않는다.
 * 홈(activeTrack="all")은 분야 구분 없이 전체 공고를 보여주므로 트랙 일치 검사를 생략한다.
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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeQuickLink, setActiveQuickLink] = useState("preference");
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(null);
  const filterState = useJobFilters(false, { syncUrl: false });
  const activeJobTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeJobTrack];
  const showAllTracks = selectedTrack === "all";

  useEffect(() => {
    const nextTrack = trackToJobTrack(selectedTrack);
    if (filterState.filters.track !== nextTrack) {
      filterState.setTrack(nextTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack, filterState.filters.track]);

  // 분야(또는 홈의 기본 분야)가 바뀔 때마다 해당 분야의 저장된 관심조건만 불러온다 — 자동 적용은 하지 않는다.
  useEffect(() => {
    setPreferenceState(getStoredJobPreference(trackToJobTrack(selectedTrack)));
  }, [selectedTrack]);

  const filteredJobs = useMemo(
    () => filterJobsByFilters(jobs, filterState.filters, { matchTrack: !showAllTracks }),
    [filterState.filters, showAllTracks],
  );

  // 필터(분야 포함)나 정렬이 바뀌면 이전 페이지에 머물러 있지 않도록 1페이지로 되돌린다.
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.filters, sortOption]);

  const visibleJobs = useMemo(() => {
    const sorted = sortJobs(filteredJobs, sortOption);
    if (sorted.length === 0) return [];

    const pageOffset = ((currentPage - 1) * PAGE_SIZE) % sorted.length;
    return [...sorted.slice(pageOffset), ...sorted.slice(0, pageOffset)].slice(0, PAGE_SIZE);
  }, [currentPage, filteredJobs, sortOption]);

  const applyPreference = (nextPreference: UserJobPreference) => {
    setPreferenceState(nextPreference);
    filterState.applyPreference(nextPreference);
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

            {visibleJobs.length ? (
              <div className="flex flex-col gap-1.5">
                {visibleJobs.map((job) => (
                  <JobCard key={`home-${job.id}-${currentPage}-${sortOption}`} job={job} isBookmarked={bookmarkedIds.includes(job.id)} onToggleBookmark={onToggleBookmark} />
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
            track={activeJobTrack}
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
    </section>
  );
}
