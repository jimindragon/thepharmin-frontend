"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { CategoryTabs } from "@/components/CategoryTabs";
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
import { compareJobsByDeadline, isJobExpired } from "@/utils/dday";

const PAGE_SIZE = 6;

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") return b.dateOrder - a.dateOrder;
    if (sortOption === "마감임박순") return compareJobsByDeadline(a, b);
    if (sortOption === "시급 높은순") {
      const aMax = a.salaryDetail?.hourlyComputed?.max ?? a.salaryDetail?.hourlyComputed?.min ?? 0;
      const bMax = b.salaryDetail?.hourlyComputed?.max ?? b.salaryDetail?.hourlyComputed?.min ?? 0;
      return bMax - aMax;
    }
    return (
      Number(b.isRecommended) - Number(a.isRecommended) ||
      Number(isJobExpired(a)) - Number(isJobExpired(b)) ||
      b.dateOrder - a.dateOrder
    );
  });
}

const pharmacySortOptions: SortOption[] = ["추천순", "최신순", "마감임박순", "시급 높은순"];

/**
 * 홈 화면과 산업·연구·병원·약국 분야별 랜딩 페이지가 공유하는 "공고 둘러보기" 섹션.
 * `activeTrack`으로 받은 분야에 맞춰 검색·필터·추천·목록을 구성한다.
 *
 * 분야(트랙)는 페이지의 기본 범위 조건이라 항상 유지되고, 관심조건은 사용자가 사이드바에서
 * 직접 적용을 선택했을 때만 덧씌워지는 별개의 선택 필터다 — 진입 시 자동으로 적용하지 않는다.
 * 홈(activeTrack="all")에서만 산업/연구/병원/약국 트랙 탭을 노출해 사용자가 직접 트랙을 고르고,
 * 고른 트랙에 맞는 필터와 공고만 보도록 한다. 분야별 랜딩 페이지는 이미 트랙이 고정돼 있어 탭이 없다.
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
  const [preference, setPreferenceState] = useState<UserJobPreference | null>(null);
  const filterState = useJobFilters(false, { syncUrl: false });
  const activeJobTrack = filterState.filters.track;
  const activeFilterConfig = trackFilterConfigs[activeJobTrack];
  const showTrackTabs = selectedTrack === "all";

  // 마운트 시 한 번만 분야를 동기화한다 — `selectedTrack`(prop)은 페이지당 고정값이라 이후 다시 바뀌지 않으므로,
  // 여기서 `filterState.filters.track`까지 의존성에 넣으면 트랙 탭으로 사용자가 직접 고른 트랙을 매번 되돌리게 된다.
  useEffect(() => {
    const nextTrack = trackToJobTrack(selectedTrack);
    if (filterState.filters.track !== nextTrack) {
      filterState.setTrack(nextTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack]);

  // 분야(트랙 탭으로 직접 고른 분야 포함)가 바뀔 때마다 해당 분야의 저장된 관심조건만 불러온다 — 자동 적용은 하지 않는다.
  useEffect(() => {
    setPreferenceState(getStoredJobPreference(activeJobTrack));
  }, [activeJobTrack]);

  const filteredJobs = useMemo(() => filterJobsByFilters(jobs, filterState.filters), [filterState.filters]);
  const hourlyFilterActive = filterState.filters.hourlyPayRangeId !== null;

  // 필터(분야 포함)나 정렬이 바뀌면 이전 페이지에 머물러 있지 않도록 1페이지로 되돌린다.
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.filters, sortOption]);

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

  return (
    <section className="mt-20 bg-[#f5f6f7] py-16 max-[760px]:py-10">
      <div className="app-shell">
        <div className="mb-5 flex items-center gap-2">
          <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>공고 둘러보기</h2>
        </div>

        {showTrackTabs ? <CategoryTabs activeTrack={activeJobTrack} onChange={filterState.setTrack} /> : null}

        <div className={clsx("jobs-layout", showTrackTabs && "mt-3.5")}>
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
              onToggleResearchFieldCategory={filterState.toggleResearchFieldCategory}
              onToggleResearchFieldSubcategory={filterState.toggleResearchField}
              onToggleMultiFilter={filterState.toggleMultiFilter}
              onSetSingleFilter={filterState.setSingleFilter}
              onSetSpecialFilter={filterState.setSpecialFilter}
              onRemoveAppliedFilter={filterState.removeAppliedFilter}
              onResetAll={filterState.resetFilters}
            />

            <JobListToolbar
              totalCount={filteredJobs.length}
              sortOption={sortOption}
              sortOptions={activeJobTrack === "pharmacy" ? pharmacySortOptions : undefined}
              onSortChange={setSortOption}
            />

            {visibleJobs.length ? (
              <div className="flex flex-col gap-1.5">
                {visibleJobs.map((job) => (
                  <JobCard
                    key={`home-${job.id}-${currentPage}-${sortOption}`}
                    job={job}
                    isBookmarked={bookmarkedIds.includes(job.id)}
                    onToggleBookmark={onToggleBookmark}
                    showHourlyBadge={hourlyFilterActive && activeJobTrack === "pharmacy" && Boolean(job.salaryDetail?.hourlyComputed)}
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
            track={activeJobTrack}
            savedCount={bookmarkedIds.length}
            preference={preference}
            preferenceApplied={filterState.preferenceApplied}
            onApplyPreference={applyPreference}
            onClearPreferenceFilters={clearPreferenceFilters}
          />
        </div>
      </div>
    </section>
  );
}
