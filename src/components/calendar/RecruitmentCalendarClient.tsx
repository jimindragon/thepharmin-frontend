"use client";

import {
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MailCheck,
  Plus,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { hospitalTypeOptions } from "@/config/jobFilters/hospitalFilters";
import { industryJobCategoryOptions } from "@/config/jobFilters/industryFilters";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { researchInstitutionTypeOptions, researchJobCategoryOptions } from "@/config/jobFilters/researchFilters";
import { companyTypeOptions, experienceOptions } from "@/config/jobFilters/shared";
import { PageHeader } from "@/components/PageHeader";
import { ApplicationStepper } from "@/components/ui/ApplicationStepper";
import { InterestConditionCard } from "@/components/ui/InterestConditionCard";
import { JobUsageTipsCard } from "@/components/ui/JobUsageTipsCard";
import { LoginGateModal } from "@/components/ui/LoginGateModal";
import { OverlayPanel } from "@/components/ui/OverlayPanel";
import { PageTabBar } from "@/components/ui/PageTabBar";
import { sharedRoutes } from "@/config/routes";
import { calendarJobs, type CalendarEventType, type CalendarJob } from "@/data/calendar";
import { mockUserPreferences } from "@/data/mockUserPreferences";
import { MOCK_TODAY, MOCK_TODAY_DATE } from "@/config/mockToday";
import { getAllStoredJobPreferences } from "@/hooks/useJobPreferenceStorage";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { buildPreferenceChips } from "@/utils/preferenceChips";
import { formatDday, getDaysUntil } from "@/utils/dday";
import { addMonths, buildMonthDays, dateKey } from "@/utils/monthGrid";
import type { FilterOption, Job, JobCategoryOption, JobTrack } from "@/types/jobs";
import { jobs } from "@/data/jobs";
import { hasJobDetail } from "@/data/jobDetailIndex";

type CalendarTab = "all" | "saved" | "applied";
type CalendarAvailableTrack = JobTrack;
type CalendarTrackFilter = "all" | CalendarAvailableTrack;
type CalendarFilterId = "job" | "companyType" | "experience" | "institutionType" | "hospitalType" | "pharmacyFeature";
type CalendarEventView = "all" | CalendarEventType;

interface CalendarFilterState {
  jobCategoryIds: string[];
  jobSubcategoryIds: string[];
  companyTypeIds: string[];
  institutionTypeIds: string[];
  hospitalTypeIds: string[];
  pharmacyFeatureIds: string[];
  experienceId: string | null;
}

type CalendarFilterDefinition =
  | { id: "job"; label: string; kind: "job"; categories: JobCategoryOption[] }
  | { id: Exclude<CalendarFilterId, "job">; label: string; kind: "options"; selection: "single" | "multiple"; options: FilterOption[] };

const TODAY = MOCK_TODAY_DATE;
const DEFAULT_YEAR = MOCK_TODAY_DATE.getFullYear();
const DEFAULT_MONTH = MOCK_TODAY_DATE.getMonth();
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ALL_JOB_CATEGORY_ID = "__all";

/** jobId로 jobs.ts 원본 레코드를 조인하기 위한 조회 맵. 캘린더 필터가 실제 taxonomy 필드를 읽을 때 사용한다. */
const jobsById = new Map(jobs.map((job) => [job.id, job]));

/** shortLabel은 ≤760px 전용 축약형 — 카운트 뱃지·자물쇠까지 48px 탭 박스에 수납하기 위한 것이다. */
const tabs: Array<{ id: CalendarTab; label: string; shortLabel: string }> = [
  { id: "all", label: "전체 공고", shortLabel: "전체 공고" },
  { id: "saved", label: "스크랩한 공고", shortLabel: "스크랩" },
  { id: "applied", label: "지원한 공고", shortLabel: "지원" },
];

const calendarTrackOptions: Array<{ id: CalendarTrackFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "industry", label: "산업" },
  { id: "research", label: "연구" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

const eventTypeLabels: Record<CalendarEventType, string> = {
  deadline: "마감",
  start: "시작",
};

const eventTypeStyles: Record<CalendarEventType, { marker: string; dot: string; text: string }> = {
  deadline: {
    marker: "bg-[#e95544]",
    dot: "bg-[#e95544]",
    text: "text-[#e95544]",
  },
  start: {
    marker: "bg-[#337ddf]",
    dot: "bg-[#337ddf]",
    text: "text-[#337ddf]",
  },
};

const initialCalendarFilters: CalendarFilterState = {
  jobCategoryIds: [],
  jobSubcategoryIds: [],
  companyTypeIds: [],
  institutionTypeIds: [],
  hospitalTypeIds: [],
  pharmacyFeatureIds: [],
  experienceId: null,
};

const calendarFilterDefinitions: Record<CalendarAvailableTrack, CalendarFilterDefinition[]> = {
  industry: [
    { id: "job", label: "직무", kind: "job", categories: industryJobCategoryOptions },
    { id: "companyType", label: "기업 유형", kind: "options", selection: "multiple", options: companyTypeOptions },
    { id: "experience", label: "경력", kind: "options", selection: "single", options: experienceOptions },
  ],
  research: [
    { id: "job", label: "직무", kind: "job", categories: researchJobCategoryOptions },
    { id: "institutionType", label: "기관 유형", kind: "options", selection: "multiple", options: researchInstitutionTypeOptions },
    { id: "experience", label: "경력", kind: "options", selection: "single", options: experienceOptions },
  ],
  hospital: [
    { id: "hospitalType", label: "사업장 분류", kind: "options", selection: "multiple", options: hospitalTypeOptions },
  ],
  pharmacy: [
    { id: "pharmacyFeature", label: "약국 특성", kind: "options", selection: "multiple", options: pharmacyFeatureOptions },
  ],
};

function jobMatchesTab(job: CalendarJob, activeTab: CalendarTab) {
  if (activeTab === "saved") return job.isBookmarked;
  if (activeTab === "applied") return job.isApplied;
  return true;
}

function eventTypeOf(job: CalendarJob): CalendarEventType {
  return job.eventType ?? "deadline";
}

function eventMatchesView(job: CalendarJob, view: CalendarEventView) {
  return view === "all" || eventTypeOf(job) === view;
}

function sortCalendarEvents(a: CalendarJob, b: CalendarJob) {
  const rank: Record<CalendarEventType, number> = { deadline: 0, start: 1 };
  const typeDiff = rank[eventTypeOf(a)] - rank[eventTypeOf(b)];
  if (typeDiff !== 0) return typeDiff;
  return a.companyName.localeCompare(b.companyName, "ko");
}

function postingKey(job: CalendarJob) {
  return job.jobId ? String(job.jobId) : `${job.companyName}-${job.title}`;
}

function uniquePostingCount(jobs: CalendarJob[]) {
  return new Set(jobs.map(postingKey)).size;
}

/** dateKey("YYYY-MM-DD")에서 월 스코프 비교용 "YYYY-MM" 접두어를 뽑는다. */
function monthPrefixOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** dateKey("YYYY-MM-DD")를 리스트 헤더용 "7월 21일 (화)"로 표기한다. */
function formatDayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return `${month}월 ${day}일 (${WEEKDAYS[new Date(year, month - 1, day).getDay()]})`;
}

/**
 * 일정 행의 날짜 성격 라벨.
 * CalendarJob.deadline은 eventType이 "start"일 때 실제로는 시작일이므로, 날짜만 보고 마감으로 읽으면 안 된다.
 * 이미 지난 마감은 D+n 대신 "마감"으로만 표기한다.
 */
function eventScheduleLabel(job: CalendarJob) {
  if (eventTypeOf(job) === "start") return "접수 시작";
  const daysLeft = getDaysUntil(job.deadline.replace(/-/g, "."), MOCK_TODAY);
  return daysLeft < 0 ? "마감" : `마감 ${formatDday(daysLeft)}`;
}

/**
 * 모바일 일정 리스트의 초기 선택일: 오늘 → (오늘 일정이 없으면) 이번 달에서 오늘 이후 가장 이른 일정일 → 오늘.
 * 마운트 시 1회만 쓰이므로 필터가 걸리기 전의 원본 calendarJobs를 본다.
 */
function initialSelectedDateKey() {
  const todayKey = dateKey(TODAY);
  const eventKeys = new Set(calendarJobs.map((job) => job.deadline));
  if (eventKeys.has(todayKey)) return todayKey;

  const monthPrefix = monthPrefixOf(TODAY);
  const nextKey = Array.from(eventKeys)
    .filter((key) => key.startsWith(monthPrefix) && key > todayKey)
    .sort()[0];

  return nextKey ?? todayKey;
}

function optionLabel(options: FilterOption[], id: string) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function categoryIdForSubcategory(categories: JobCategoryOption[], subcategoryId: string) {
  return categories.find((category) => category.subcategories.some((subcategory) => subcategory.id === subcategoryId))?.id;
}

function summaryFromOptions(options: FilterOption[], selectedIds: string[]) {
  if (selectedIds.length === 0) return "";
  if (selectedIds.length === 1) return optionLabel(options, selectedIds[0]);
  return `${optionLabel(options, selectedIds[0])} 외 ${selectedIds.length - 1}개`;
}

function summaryForCalendarFilter(definition: CalendarFilterDefinition, filters: CalendarFilterState) {
  if (definition.kind === "job") {
    const categoryOptions = definition.categories.map((category) => ({ id: category.id, label: `${category.label} 전체` }));
    const options = [...categoryOptions, ...definition.categories.flatMap((category) => category.subcategories)];
    return summaryFromOptions(options, [...filters.jobCategoryIds, ...filters.jobSubcategoryIds]);
  }

  if (definition.id === "experience") {
    return filters.experienceId ? optionLabel(definition.options, filters.experienceId) : "";
  }

  const stateKey =
    definition.id === "companyType"
      ? "companyTypeIds"
      : definition.id === "institutionType"
        ? "institutionTypeIds"
        : definition.id === "pharmacyFeature"
          ? "pharmacyFeatureIds"
          : "hospitalTypeIds";

  return summaryFromOptions(definition.options, filters[stateKey]);
}

function toggleArrayItem(items: string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

/** useJobFilters.ts의 동명 유틸과 동일한 구간 겹침 판정(경력 필터용). 별도 모듈로 뺄 만큼 크지 않아 이 파일에 둔다. */
function rangeOverlaps(jobMin: number, jobMax: number | null, selectedMin: number | null, selectedMax: number | null) {
  if (selectedMin === null && selectedMax === null) return true;
  const actualJobMax = jobMax ?? Number.POSITIVE_INFINITY;
  const actualSelectedMax = selectedMax ?? Number.POSITIVE_INFINITY;
  const actualSelectedMin = selectedMin ?? 0;
  return jobMin <= actualSelectedMax && actualJobMax >= actualSelectedMin;
}

function matchesExperience(job: Job, experienceId: string) {
  const option = experienceOptions.find((candidate) => candidate.id === experienceId);
  if (!option) return true;
  return rangeOverlaps(job.experienceMin, job.experienceMax, option.min, option.max);
}

function categoryIdsForSubcategories(categories: JobCategoryOption[], subcategoryIds: string[]) {
  return Array.from(
    new Set(
      subcategoryIds
        .map((subcategoryId) => categoryIdForSubcategory(categories, subcategoryId))
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

function jobMatchesCalendarFilters(calendarJob: CalendarJob, filters: CalendarFilterState) {
  const job = calendarJob.jobId ? jobsById.get(calendarJob.jobId) : undefined;

  if (calendarJob.track === "industry") {
    const subcategoryIds = job?.jobSubcategoryIds ?? [];
    const categoryIds = categoryIdsForSubcategories(industryJobCategoryOptions, subcategoryIds);
    const hasJobFilter = filters.jobCategoryIds.length > 0 || filters.jobSubcategoryIds.length > 0;
    const jobMatched =
      !hasJobFilter ||
      filters.jobCategoryIds.some((id) => categoryIds.includes(id)) ||
      filters.jobSubcategoryIds.some((id) => subcategoryIds.includes(id));
    const companyMatched =
      filters.companyTypeIds.length === 0 || (job ? filters.companyTypeIds.includes(job.companyTypeId) : false);
    const experienceMatched = !filters.experienceId || (job ? matchesExperience(job, filters.experienceId) : false);
    return jobMatched && companyMatched && experienceMatched;
  }

  if (calendarJob.track === "research") {
    const subcategoryIds = job?.jobSubcategoryIds ?? [];
    const categoryIds = categoryIdsForSubcategories(researchJobCategoryOptions, subcategoryIds);
    const hasJobFilter = filters.jobCategoryIds.length > 0 || filters.jobSubcategoryIds.length > 0;
    const jobMatched =
      !hasJobFilter ||
      filters.jobCategoryIds.some((id) => categoryIds.includes(id)) ||
      filters.jobSubcategoryIds.some((id) => subcategoryIds.includes(id));
    const institutionMatched =
      filters.institutionTypeIds.length === 0 || (job ? filters.institutionTypeIds.includes(job.organizationType) : false);
    const experienceMatched = !filters.experienceId || (job ? matchesExperience(job, filters.experienceId) : false);
    return jobMatched && institutionMatched && experienceMatched;
  }

  if (calendarJob.track === "hospital") {
    return filters.hospitalTypeIds.length === 0 || (job?.hospitalTypeId ? filters.hospitalTypeIds.includes(job.hospitalTypeId) : false);
  }

  if (calendarJob.track === "pharmacy") {
    return filters.pharmacyFeatureIds.length === 0 || (job?.pharmacyFeatureIds ? filters.pharmacyFeatureIds.includes(job.pharmacyFeatureIds) : false);
  }

  return false;
}

/** V2 상세가 등록되지 않은 slug는 상세 페이지 대신 해당 트랙 검색으로 폴백한다. calendar.ts의 href 데이터 자체는 건드리지 않는다. */
function resolveJobHref(job: CalendarJob) {
  const slug = job.href.startsWith("/jobs/") ? job.href.slice("/jobs/".length) : undefined;
  if (slug && hasJobDetail(slug)) return job.href;
  return `/jobs?track=${job.track}`;
}

function CalendarOptionChip({
  option,
  active,
  onClick,
}: {
  option: FilterOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[34px] border px-3 py-1.5 text-left text-[12px] font-medium leading-[1.35] transition ${
        active ? "border-[#111111] bg-[#111111] text-white" : "border-[#dfe4ea] bg-white text-[#424b57] hover:border-[#111111]"
      }`}
      title={option.description}
    >
      <span>{option.label}</span>
    </button>
  );
}

function CalendarJobFilterBody({
  categories,
  filters,
  onClear,
  onToggleCategory,
  onToggleSubcategory,
}: {
  categories: JobCategoryOption[];
  filters: CalendarFilterState;
  onClear: () => void;
  onToggleCategory: (id: string, subcategoryIds: string[]) => void;
  onToggleSubcategory: (id: string, categoryId?: string) => void;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_JOB_CATEGORY_ID);
  const activeCategory = activeCategoryId === ALL_JOB_CATEGORY_ID ? null : categories.find((category) => category.id === activeCategoryId) ?? categories[0];
  const visibleSubcategories = activeCategory ? activeCategory.subcategories : categories.flatMap((category) => category.subcategories);
  const activeCategorySubcategoryCount =
    activeCategory?.subcategories.filter((subcategory) => filters.jobSubcategoryIds.includes(subcategory.id)).length ?? 0;
  const activeCategoryAllSelected = Boolean(activeCategory && filters.jobCategoryIds.includes(activeCategory.id));

  useEffect(() => {
    setActiveCategoryId(ALL_JOB_CATEGORY_ID);
  }, [categories]);

  return (
    <div className="grid gap-3.5 md:grid-cols-[200px_1fr]">
      <div className="border border-[#e3e7ec] bg-white">
        <button
          type="button"
          className={`flex h-[38px] w-full items-center border-b border-[#eef1f4] px-3 text-left text-[12px] font-medium ${
            activeCategoryId === ALL_JOB_CATEGORY_ID ? "bg-[#080808] text-white" : "bg-white text-[#46505d] hover:bg-[#f6f7f8]"
          }`}
          onClick={() => {
            setActiveCategoryId(ALL_JOB_CATEGORY_ID);
            onClear();
          }}
        >
          전체
        </button>
        {categories.map((category) => {
          const selectedSubcategoryCount = category.subcategories.filter((subcategory) => filters.jobSubcategoryIds.includes(subcategory.id)).length;
          const selectedCategoryAll = filters.jobCategoryIds.includes(category.id);
          const selected = selectedCategoryAll || selectedSubcategoryCount > 0;
          const active = activeCategory?.id === category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={`flex h-[38px] w-full items-center justify-between gap-3 border-b border-[#eef1f4] px-3 text-left text-[12px] font-medium last:border-b-0 ${
                active ? "bg-[#080808] text-white" : selected ? "bg-[#f4f4f4] text-[#171b20]" : "bg-white text-[#46505d] hover:bg-[#f6f7f8]"
              }`}
              onClick={() => {
                setActiveCategoryId(category.id);
                onToggleCategory(
                  category.id,
                  category.subcategories.map((subcategory) => subcategory.id),
                );
              }}
            >
              <span>{category.label}</span>
              {selected ? (
                <span className={`shrink-0 text-[12px] ${active ? "text-white/75" : "text-[#8a93a1]"}`}>
                  {selectedCategoryAll && selectedSubcategoryCount === 0 ? "전체" : selectedSubcategoryCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="border border-[#e3e7ec] bg-[#fbfcfc] p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium text-[#2c3440]">{activeCategory?.label ?? "전체"}</p>
          {activeCategory ? (
            <p className="text-[12px] font-medium text-[#8a93a1]">
              {activeCategoryAllSelected ? "전체 선택" : activeCategorySubcategoryCount ? `${activeCategorySubcategoryCount}개 선택` : "2차 선택 사항"}
            </p>
          ) : null}
        </div>
        {activeCategory ? (
          <div className="mb-3 flex flex-wrap gap-2 border-b border-[#eef1f4] pb-3">
            <CalendarOptionChip
              option={{ id: `${activeCategory.id}-all`, label: `${activeCategory.label} 전체` }}
              active={activeCategoryAllSelected}
              onClick={() =>
                onToggleCategory(
                  activeCategory.id,
                  activeCategory.subcategories.map((subcategory) => subcategory.id),
                )
              }
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {visibleSubcategories.map((subcategory) => (
            <CalendarOptionChip
              key={subcategory.id}
              option={subcategory}
              active={filters.jobSubcategoryIds.includes(subcategory.id)}
              onClick={() => onToggleSubcategory(subcategory.id, categoryIdForSubcategory(categories, subcategory.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarOptionsFilterBody({
  definition,
  filters,
  onClear,
  onToggle,
}: {
  definition: Extract<CalendarFilterDefinition, { kind: "options" }>;
  filters: CalendarFilterState;
  onClear: (definition: Extract<CalendarFilterDefinition, { kind: "options" }>) => void;
  onToggle: (definition: Extract<CalendarFilterDefinition, { kind: "options" }>, id: string) => void;
}) {
  const selectedIds =
    definition.id === "experience"
      ? filters.experienceId
        ? [filters.experienceId]
        : []
      : definition.id === "companyType"
        ? filters.companyTypeIds
        : definition.id === "institutionType"
          ? filters.institutionTypeIds
          : definition.id === "pharmacyFeature"
            ? filters.pharmacyFeatureIds
            : filters.hospitalTypeIds;

  return (
    <div className="flex flex-wrap gap-2">
      <CalendarOptionChip option={{ id: "all", label: "전체" }} active={selectedIds.length === 0} onClick={() => onClear(definition)} />
      {definition.options.map((option) => (
        <CalendarOptionChip key={option.id} option={option} active={selectedIds.includes(option.id)} onClick={() => onToggle(definition, option.id)} />
      ))}
    </div>
  );
}

function CalendarJobChip({ job }: { job: CalendarJob }) {
  const eventType = eventTypeOf(job);
  const style = eventTypeStyles[eventType];

  return (
    <Link
      href={resolveJobHref(job)}
      className={`group block w-full max-w-full min-w-0 overflow-hidden border px-2 py-1.5 text-left transition hover:border-[#111111] ${
        job.isBookmarked ? "border-[#c7ced8] bg-[#f6f7f8]" : "border-[#edf0f3] bg-white hover:bg-[#fbfbfb]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${style.marker}`} aria-label={eventTypeLabels[eventType]} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-[15px] text-[#232830]">
          {job.companyName}
        </span>
      </div>
      <p className="mt-0.5 truncate pl-3.5 text-[11px] font-medium leading-[13px] text-[#8a93a1]">{job.role}</p>
    </Link>
  );
}

/**
 * ≤760px 전용 미니 월간 캘린더. 데스크톱 월 그리드(min-w-[900px] 가로 스크롤)를 대체한다.
 * days·jobsByDate를 데스크톱 그리드와 같은 소스에서 받으므로 점이 찍히는 날짜는 그리드의 칩과 항상 일치한다.
 * 마이페이지 DashboardMiniCalendar와는 데이터 소스(mockApplications/scraps)와 인터랙션 유무가 달라 공유하지 않고,
 * 날짜 계산만 monthGrid.ts 유틸로 공유한다.
 */
function MiniMonthCalendar({
  days,
  visibleMonthIndex,
  jobsByDate,
  selectedDateKey,
  onSelectDate,
}: {
  days: Date[];
  visibleMonthIndex: number;
  jobsByDate: Map<string, CalendarJob[]>;
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
}) {
  const todayKey = dateKey(TODAY);

  return (
    <div className="px-3 py-4">
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            className={`py-1 text-center text-[12px] font-medium ${
              index === 0 ? "text-[#e95544]" : index === 6 ? "text-[#337ddf]" : "text-[#87909d]"
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = dateKey(day);
          const inCurrentMonth = day.getMonth() === visibleMonthIndex;
          const isToday = key === todayKey;
          const isSelected = key === selectedDateKey;
          const isSunday = day.getDay() === 0;
          const isSaturday = day.getDay() === 6;
          const dayJobs = jobsByDate.get(key) ?? [];
          // 같은 날 마감·시작이 공존하면 점 2개. dayJobs는 이미 마감 우선으로 정렬돼 있어 순서가 범례와 같다.
          const eventTypes = Array.from(new Set(dayJobs.map(eventTypeOf)));

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              aria-pressed={isSelected}
              aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일${dayJobs.length > 0 ? ` 일정 ${dayJobs.length}건` : " 일정 없음"}`}
              className="flex min-h-[48px] flex-col items-center gap-1 py-1.5"
            >
              {/* 오늘=테두리, 선택=채움 — 두 상태가 같은 날이면 채움이 이김 (선택 우선) */}
              <span
                className={`grid h-7 w-7 place-items-center text-[14px] font-medium ${
                  isSelected
                    ? "bg-[#111111] text-white"
                    : isToday
                      ? "border-[1.5px] border-[#111111] text-[#111111]"
                      : !inCurrentMonth
                        ? "text-[#c4cad3]"
                        : isSunday
                          ? "text-[#e95544]"
                          : isSaturday
                            ? "text-[#337ddf]"
                            : "text-[#3d4652]"
                }`}
              >
                {day.getDate()}
              </span>
              <span className="flex h-[5px] items-center gap-[3px]">
                {eventTypes.map((eventType) => (
                  <span key={eventType} className={`h-[5px] w-[5px] rounded-full ${eventTypeStyles[eventType].dot}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationSummaryCard({ job }: { job: CalendarJob }) {
  return (
    <Link
      href="/mypage/applications"
      className="block h-full border border-[#e5e8ec] bg-white p-3.5 transition hover:border-[#111111] hover:bg-[#fbfbfb]"
    >
      {job.statusLabel ? (
        <span
          className={`inline-block px-2.5 py-1 text-[12px] font-medium ${
            job.statusLabel.includes("면접") ? "bg-[#f1f3f5] text-[#111111]" : "bg-[#fff0ec] text-[#e95544]"
          }`}
        >
          {job.statusLabel}
        </span>
      ) : null}
      <p className="mt-3 truncate text-[14px] font-medium text-[#1e232b]">{job.companyName}</p>
      <p className="mt-1 truncate text-[12px] font-medium text-[#8b94a2]">{job.title}</p>
      <ApplicationStepper currentStage={job.applicationStage ?? "applied"} />
    </Link>
  );
}

function ApplicationMoreCard() {
  return (
    <Link
      href="/mypage/applications"
      className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 border border-dashed border-[#d8dce2] bg-white p-3.5 text-[#5f6875] transition hover:border-[#111111] hover:text-[#111111]"
    >
      <Plus size={18} />
      <span className="text-[13px] font-medium">지원 현황 더보기</span>
    </Link>
  );
}

/**
 * 하루치 일정 1행. 데스크톱 "+N 더보기" 모달과 ≤760px 선택 날짜 리스트가 공유한다.
 * JobCard 선례대로 행 전면에 링크를 깔아 어디를 눌러도 상세로 이동한다.
 */
function CalendarDayJobRow({ job }: { job: CalendarJob }) {
  const eventType = eventTypeOf(job);
  const style = eventTypeStyles[eventType];

  return (
    <article
      className={`relative flex min-w-0 items-start justify-between gap-3 border p-3 transition hover:border-[#111111] ${
        job.isBookmarked ? "border-[#c7ced8] bg-[#f6f7f8]" : "border-[#e4e8ee] bg-white"
      }`}
    >
      <Link
        href={resolveJobHref(job)}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.18)]"
        aria-label={`${job.companyName} ${job.title} 상세 보기`}
      />
      <div className="flex min-w-0 items-start gap-2">
        <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${style.marker}`} aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#222832]">{job.companyName}</p>
          <p className="mt-1 truncate text-[12px] font-medium text-[#87909d]">{job.title}</p>
        </div>
      </div>
      <span className={`shrink-0 text-[12px] font-medium ${style.text}`}>{eventScheduleLabel(job)}</span>
    </article>
  );
}

function CalendarDayJobList({ jobs, className = "" }: { jobs: CalendarJob[]; className?: string }) {
  return (
    <div className={`grid gap-2 ${className}`}>
      {jobs.map((job) => (
        <CalendarDayJobRow key={job.id} job={job} />
      ))}
    </div>
  );
}

/**
 * 다가오는 지원 일정 요약.
 * 데스크톱은 3탭 바로 아래, ≤760px에서는 캘린더 아래에 놓여야 하는데 두 위치가 서로 다른 부모에 속해
 * CSS order로는 재배열되지 않는다. 그래서 같은 블록을 양쪽에 렌더하고 브레이크포인트로 한쪽만 남긴다.
 */
function UpcomingApplicationsSection({
  jobs,
  totalCount,
  className = "",
}: {
  jobs: CalendarJob[];
  totalCount: number;
  className?: string;
}) {
  return (
    <section className={`border border-[#e0e5eb] bg-white p-5 max-[760px]:p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock size={17} strokeWidth={2} className="text-gray-700" />
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#1f252d] max-[760px]:text-[16px]">다가오는 지원 일정</h2>
          </div>
          {/* 같은 내용이 /mypage/applications에 있어 모바일에서는 부연 설명을 접는다. */}
          <p className="mt-1.5 text-[13px] font-medium text-[#8b94a2] max-[760px]:hidden">지원 중인 공고의 다음 일정을 확인하세요.</p>
        </div>
        <Link href="/mypage/applications" className="shrink-0 text-[13px] font-medium text-[#5f6875] hover:text-[#111111] max-[760px]:text-[12px]">
          전체 지원 현황 보기 &gt;
        </Link>
      </div>
      {/*
        ≤760px에서는 세로 스택 대신 가로 스크롤 1행. 카드 너비·shrink는 자식 선택자로만 얹어
        데스크톱 grid(md:2열 / lg:4열)의 DOM과 렌더 결과를 그대로 둔다.
      */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4 max-[760px]:flex max-[760px]:overflow-x-auto max-[760px]:[&>*]:w-[248px] max-[760px]:[&>*]:shrink-0">
        {jobs.map((job) => (
          <ApplicationSummaryCard key={job.id} job={job} />
        ))}
        {totalCount > 3 ? <ApplicationMoreCard /> : null}
      </div>
    </section>
  );
}

function MoreJobsModal({
  dateLabel,
  jobs,
  onClose,
}: {
  dateLabel: string;
  jobs: CalendarJob[];
  onClose: () => void;
}) {
  return (
    <OverlayPanel
      ariaLabel={`${dateLabel} 채용 일정`}
      onClose={onClose}
      maxWidth="max-w-[520px]"
      padding="p-5"
      headerAlign="center"
      header={
        <>
          <p className="text-[12px] font-medium text-[#6b7280]">채용 일정</p>
          <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-[#171b20]">{dateLabel}</h2>
        </>
      }
    >
      <CalendarDayJobList jobs={jobs} className="mt-5" />
    </OverlayPanel>
  );
}

export function RecruitmentCalendarClient() {
  const router = useRouter();
  const { isLoggedIn, login } = usePersonalLoginState();
  const [activeTab, setActiveTab] = useState<CalendarTab>("all");
  const [visibleMonth, setVisibleMonth] = useState(new Date(DEFAULT_YEAR, DEFAULT_MONTH, 1));
  const [trackFilter, setTrackFilter] = useState<CalendarTrackFilter>("all");
  const [calendarFilters, setCalendarFilters] = useState<CalendarFilterState>(initialCalendarFilters);
  const [eventView, setEventView] = useState<CalendarEventView>("all");
  const [openFilterId, setOpenFilterId] = useState<CalendarFilterId | null>(null);
  const [interestConditionApplied, setInterestConditionApplied] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [moreJobs, setMoreJobs] = useState<{ dateLabel: string; jobs: CalendarJob[] } | null>(null);
  const [emailAlertOn, setEmailAlertOn] = useState(false);
  /** ≤760px 미니 캘린더에서 선택된 날짜. 데스크톱 렌더는 이 값을 읽지 않는다. */
  const [selectedDateKey, setSelectedDateKey] = useState(initialSelectedDateKey);

  useEffect(() => {
    const stored = getAllStoredJobPreferences();
    setEmailAlertOn(Object.values(stored).some((preference) => preference?.emailAlertEnabled));
  }, []);

  const availableCalendarJobs = calendarJobs;

  const activeFilterDefinitions = useMemo(
    () => (trackFilter === "all" ? [] : calendarFilterDefinitions[trackFilter]),
    [trackFilter],
  );

  const allTabFilteredJobs = useMemo(() => {
    return availableCalendarJobs.filter((job) => {
      if (!eventMatchesView(job, eventView)) return false;
      if (trackFilter === "all") return true;
      return job.track === trackFilter && jobMatchesCalendarFilters(job, calendarFilters);
    });
  }, [availableCalendarJobs, calendarFilters, eventView, trackFilter]);

  const tabCounts = useMemo(
    () => ({
      all: uniquePostingCount(allTabFilteredJobs),
      saved: uniquePostingCount(availableCalendarJobs.filter((job) => eventMatchesView(job, eventView) && job.isBookmarked)),
      applied: uniquePostingCount(availableCalendarJobs.filter((job) => eventMatchesView(job, eventView) && job.isApplied)),
    }),
    [allTabFilteredJobs, availableCalendarJobs, eventView],
  );

  /** 비로그인 탭은 숨기지 않고 자물쇠를 달아 남긴다 — 눌렀을 때 로그인 모달로 안내하는 것이 이 탭의 동작이다. */
  const tabItems = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        count: tabCounts[tab.id],
        locked: tab.id !== "all" && !isLoggedIn,
      })),
    [isLoggedIn, tabCounts],
  );

  const filteredJobs = useMemo(() => {
    if (activeTab === "all") return allTabFilteredJobs;
    return availableCalendarJobs.filter((job) => eventMatchesView(job, eventView) && jobMatchesTab(job, activeTab));
  }, [activeTab, allTabFilteredJobs, availableCalendarJobs, eventView]);

  const jobsByDate = useMemo(() => {
    const map = new Map<string, CalendarJob[]>();
    filteredJobs.forEach((job) => {
      const current = map.get(job.deadline) ?? [];
      current.push(job);
      map.set(job.deadline, current.sort(sortCalendarEvents));
    });
    return map;
  }, [filteredJobs]);

  const days = useMemo(() => buildMonthDays(visibleMonth.getFullYear(), visibleMonth.getMonth()), [visibleMonth]);

  const selectedDayJobs = useMemo(() => jobsByDate.get(selectedDateKey) ?? [], [jobsByDate, selectedDateKey]);

  /** 선택일이 비었을 때 안내할 다음 일정일. 월 이동은 로그인 게이트가 있으므로 보이는 달 안에서만 찾는다. */
  const nextEventDateKey = useMemo(() => {
    const monthPrefix = monthPrefixOf(visibleMonth);
    return (
      Array.from(jobsByDate.keys())
        .filter((key) => key.startsWith(monthPrefix) && key > selectedDateKey)
        .sort()[0] ?? null
    );
  }, [jobsByDate, selectedDateKey, visibleMonth]);
  const appliedJobsAll = useMemo(() => {
    const seen = new Set<string>();
    return availableCalendarJobs.filter((job) => job.isApplied).filter((job) => {
      const key = postingKey(job);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [availableCalendarJobs]);
  const appliedJobsCount = appliedJobsAll.length;
  const appliedJobs = useMemo(() => appliedJobsAll.slice(0, 3), [appliedJobsAll]);

  /** 트랙별 저장 파이프라인이 아직 없어 전 트랙의 mock 관심조건을 합쳐 칩으로 보여준다 — 데이터 정비는 별도 범위. */
  const interestConditionChips = useMemo(() => {
    const chips = Object.values(mockUserPreferences).flatMap((preference) => (preference ? buildPreferenceChips(preference) : []));
    return Array.from(new Set(chips));
  }, []);

  const requireLogin = () => {
    if (isLoggedIn) return false;
    setLoginModalOpen(true);
    return true;
  };

  const handleTabChange = (tab: CalendarTab) => {
    if (tab !== "all" && requireLogin()) return;
    setActiveTab(tab);
  };

  const moveMonth = (amount: number) => {
    if (requireLogin()) return;
    const next = addMonths(visibleMonth, amount);
    setVisibleMonth(next);
    // 모바일 선택일이 이전 달에 남아 미니 캘린더와 리스트가 어긋나지 않도록 새 달 1일로 옮긴다.
    setSelectedDateKey(dateKey(next));
  };

  const moveToday = () => {
    setVisibleMonth(new Date(DEFAULT_YEAR, DEFAULT_MONTH, 1));
    setSelectedDateKey(initialSelectedDateKey());
  };

  const updateTrackFilter = (nextTrack: CalendarTrackFilter) => {
    setTrackFilter(nextTrack);
    setCalendarFilters(initialCalendarFilters);
    setOpenFilterId(null);
  };

  const resetCalendarFilters = () => {
    setCalendarFilters(initialCalendarFilters);
    setOpenFilterId(null);
  };

  const clearJobFilter = () => {
    setCalendarFilters((current) => ({
      ...current,
      jobCategoryIds: [],
      jobSubcategoryIds: [],
    }));
  };

  const toggleJobCategory = (id: string, subcategoryIds: string[] = []) => {
    setCalendarFilters((current) => {
      const selected = current.jobCategoryIds.includes(id);

      return {
        ...current,
        jobCategoryIds: selected ? current.jobCategoryIds.filter((categoryId) => categoryId !== id) : [...current.jobCategoryIds, id],
        jobSubcategoryIds: current.jobSubcategoryIds.filter((subcategoryId) => !subcategoryIds.includes(subcategoryId)),
      };
    });
  };

  const toggleJobSubcategory = (id: string, categoryId?: string) => {
    setCalendarFilters((current) => {
      const selected = current.jobSubcategoryIds.includes(id);

      if (selected) {
        return {
          ...current,
          jobSubcategoryIds: current.jobSubcategoryIds.filter((subcategoryId) => subcategoryId !== id),
        };
      }

      return {
        ...current,
        jobCategoryIds: categoryId ? current.jobCategoryIds.filter((selectedCategoryId) => selectedCategoryId !== categoryId) : current.jobCategoryIds,
        jobSubcategoryIds: [...current.jobSubcategoryIds, id],
      };
    });
  };

  const clearOptionsFilter = (definition: Extract<CalendarFilterDefinition, { kind: "options" }>) => {
    setCalendarFilters((current) => {
      if (definition.id === "experience") {
        return { ...current, experienceId: null };
      }

      if (definition.id === "companyType") {
        return { ...current, companyTypeIds: [] };
      }

      if (definition.id === "institutionType") {
        return { ...current, institutionTypeIds: [] };
      }

      if (definition.id === "pharmacyFeature") {
        return { ...current, pharmacyFeatureIds: [] };
      }

      return { ...current, hospitalTypeIds: [] };
    });
  };

  const toggleOptionsFilter = (definition: Extract<CalendarFilterDefinition, { kind: "options" }>, id: string) => {
    setCalendarFilters((current) => {
      if (definition.id === "experience") {
        return { ...current, experienceId: current.experienceId === id ? null : id };
      }

      if (definition.id === "companyType") {
        return { ...current, companyTypeIds: toggleArrayItem(current.companyTypeIds, id) };
      }

      if (definition.id === "institutionType") {
        return { ...current, institutionTypeIds: toggleArrayItem(current.institutionTypeIds, id) };
      }

      if (definition.id === "pharmacyFeature") {
        return { ...current, pharmacyFeatureIds: toggleArrayItem(current.pharmacyFeatureIds, id) };
      }

      return { ...current, hospitalTypeIds: toggleArrayItem(current.hospitalTypeIds, id) };
    });
  };

  const applyInterestCondition = () => {
    if (requireLogin()) return;
    setActiveTab("all");
    setTrackFilter("industry");
    setCalendarFilters({
      ...initialCalendarFilters,
      jobSubcategoryIds: ["ra"],
      experienceId: "3-5",
    });
    setOpenFilterId(null);
    setInterestConditionApplied(true);
  };

  const clearInterestCondition = () => {
    setTrackFilter("all");
    setCalendarFilters(initialCalendarFilters);
    setOpenFilterId(null);
    setInterestConditionApplied(false);
  };

  const showSavedJobs = () => {
    if (requireLogin()) return;
    setActiveTab("saved");
  };

  const showRecentJobs = () => {
    router.push(sharedRoutes.myPageRecentJobs);
  };

  const goToPreferences = () => {
    if (requireLogin()) return;
    router.push(sharedRoutes.myPagePreferences);
  };

  const openFilterDefinition = activeFilterDefinitions.find((definition) => definition.id === openFilterId) ?? null;

  return (
    <>
      <main className="min-h-screen bg-[#f7f8fa] pb-9">
        <div className="app-shell pt-8">
          <PageHeader
            breadcrumbLabel="채용 캘린더"
            eyebrow="THE PHARMA CALENDAR"
            title="채용 캘린더"
            description="채용 시작일과 마감일을 한눈에 확인하고 관심·지원 현황을 함께 추적하세요."
            mobileDescription="hidden"
          />

          <PageTabBar
            className="mt-7"
            ariaLabel="캘린더 공고 범위"
            items={tabItems}
            activeId={activeTab}
            onSelect={handleTabChange}
          />

          {appliedJobsCount > 0 ? (
            <UpcomingApplicationsSection jobs={appliedJobs} totalCount={appliedJobsCount} className="mt-3.5 max-[760px]:hidden" />
          ) : null}

          <div className="jobs-layout mt-3.5">
            <section className="overflow-hidden border border-[#e0e5eb] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ebef] px-5 py-5 max-[760px]:gap-3">
                {/* ≤760px에서는 "오늘"이 아래 필터 행으로 내려가 이 줄에 ◀·월·▶만 남으므로 단순 중앙 정렬로 충분하다. 데스크톱은 기존 좌측 flex 행 그대로. */}
                <div className="flex items-center gap-4 max-[760px]:w-full max-[760px]:justify-center">
                  <div className="flex items-center gap-4 max-[760px]:gap-2">
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center border border-[#dfe4eb] bg-white text-[#5f6875] hover:border-[#1b1f25] hover:text-[#1b1f25]"
                      onClick={() => moveMonth(-1)}
                      aria-label="이전 달"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h2 className="min-w-[132px] text-center text-[28px] font-bold tracking-[-0.02em] text-[#20242b] max-[760px]:min-w-[92px] max-[760px]:text-[20px]">
                      {visibleMonth.getFullYear()}. {String(visibleMonth.getMonth() + 1).padStart(2, "0")}
                    </h2>
                    <button
                      type="button"
                      className="grid h-10 w-10 place-items-center border border-[#dfe4eb] bg-white text-[#5f6875] hover:border-[#1b1f25] hover:text-[#1b1f25]"
                      onClick={() => moveMonth(1)}
                      aria-label="다음 달"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* 데스크톱 전용 "오늘" — ≤760px 대응물은 아래 필터 행 끝에 있다(부모가 달라 위치 이동 대신 두 벌로 나눈다) */}
                  <button
                    type="button"
                    className="h-10 border border-[#dfe4eb] bg-white px-4 text-[13px] font-medium text-[#4d5662] hover:border-[#1b1f25] max-[760px]:hidden"
                    onClick={moveToday}
                  >
                    오늘
                  </button>
                </div>

                {/* 트랙 필터(박스 칩)와 시각 층위 분리 — 박스 칩은 트랙만 */}
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#4d5662] max-[760px]:w-full max-[760px]:gap-4">
                  {[
                    { id: "all" as const, label: "전체" },
                    { id: "deadline" as const, label: "마감" },
                    { id: "start" as const, label: "시작" },
                  ].map((view) => {
                    const checked = eventView === view.id;
                    return (
                      <button
                        key={view.id}
                        type="button"
                        className={`inline-flex h-10 items-center gap-2 border px-3.5 transition max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:px-0 ${
                          checked
                            ? "border-[#111111] bg-[#111111] text-white max-[760px]:text-[#111111]"
                            : "border-[#dfe4eb] bg-white text-[#596373] hover:border-[#111111] max-[760px]:text-[#8a94a3]"
                        }`}
                        onClick={() => setEventView(view.id)}
                        aria-pressed={checked}
                      >
                        {view.id !== "all" ? (
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${eventTypeStyles[view.id].dot} ${checked ? "" : "max-[760px]:opacity-40"}`}
                          />
                        ) : null}
                        {view.label}
                      </button>
                    );
                  })}

                  {/* ≤760px 전용 "오늘" — ml-auto로 필터 행 우측 끝에 붙인다. 테두리·흰 배경은 데스크톱과 동일. */}
                  <button
                    type="button"
                    className="ml-auto h-10 border border-[#dfe4eb] bg-white px-4 text-[13px] font-medium text-[#4d5662] hover:border-[#1b1f25] min-[761px]:hidden"
                    onClick={moveToday}
                  >
                    오늘
                  </button>
                </div>
              </div>

              {activeTab === "all" ? (
                <div className="border-b border-[#e7ebef] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* 모바일은 wrap 대신 1행 가로 스크롤 — 트랙 칩 5개가 2줄로 접히면 미니 캘린더가 첫 화면 밖으로 밀린다 */}
                    <div className="flex flex-wrap items-center gap-2.5 max-[760px]:flex-nowrap max-[760px]:overflow-x-auto max-[760px]:pb-1">
                      {calendarTrackOptions.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          className={`h-10 shrink-0 border px-5 text-[13px] font-medium ${
                            trackFilter === track.id
                              ? "border-[#111111] bg-[#111111] text-white shadow-[0_10px_18px_rgba(17,17,17,0.10)]"
                              : "border-[#dfe4eb] bg-white text-[#4b535f] hover:border-[#111111]"
                          }`}
                          onClick={() => updateTrackFilter(track.id)}
                        >
                          {track.label}
                        </button>
                      ))}
                    </div>

                    {activeFilterDefinitions.length > 0 ? (
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 border border-[#dfe4eb] bg-white px-4 text-[13px] font-medium text-[#5f6875] hover:border-[#111111] hover:text-[#111111]"
                        onClick={resetCalendarFilters}
                      >
                        <RotateCcw size={15} />
                        필터 초기화
                      </button>
                    ) : null}
                  </div>

                  {activeFilterDefinitions.length > 0 ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeFilterDefinitions.map((definition) => {
                          const summary = summaryForCalendarFilter(definition, calendarFilters);
                          const active = openFilterId === definition.id || Boolean(summary);
                          return (
                            <button
                              key={definition.id}
                              type="button"
                              className={`inline-flex min-h-[42px] items-center gap-2 border px-4 text-[13px] font-medium transition ${
                                active
                                  ? "border-[#111111] bg-[#111111] text-white"
                                  : "border-[#dfe4eb] bg-white text-[#3f4753] hover:border-[#111111]"
                              }`}
                              onClick={() => setOpenFilterId((current) => (current === definition.id ? null : definition.id))}
                            >
                              <span>{definition.label}</span>
                              {summary ? (
                                <span className={active ? "text-white/70" : "text-[#8a93a1]"}>{summary}</span>
                              ) : null}
                              {openFilterId === definition.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          );
                        })}
                      </div>

                      {openFilterDefinition ? (
                        <div className="mt-3 border border-[#e3e7ec] bg-[#fafbfc] p-4">
                          {openFilterDefinition.kind === "job" ? (
                            <CalendarJobFilterBody
                              categories={openFilterDefinition.categories}
                              filters={calendarFilters}
                              onClear={clearJobFilter}
                              onToggleCategory={toggleJobCategory}
                              onToggleSubcategory={toggleJobSubcategory}
                            />
                          ) : (
                            <CalendarOptionsFilterBody
                              definition={openFilterDefinition}
                              filters={calendarFilters}
                              onClear={clearOptionsFilter}
                              onToggle={toggleOptionsFilter}
                            />
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="overflow-x-auto max-[760px]:hidden">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-7 border-b border-[#e8edf2] bg-white">
                    {WEEKDAYS.map((weekday, index) => (
                      <div
                        key={weekday}
                        className={`px-4 py-3 text-[13px] font-medium ${
                          index === 0 ? "text-[#e95544]" : index === 6 ? "text-[#337ddf]" : "text-[#87909d]"
                        }`}
                      >
                        {weekday}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {days.map((day) => {
                      const key = dateKey(day);
                      const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                      const dayJobs = jobsByDate.get(key) ?? [];
                      const visibleJobs = dayJobs.slice(0, 3);
                      const hiddenCount = Math.max(0, dayJobs.length - visibleJobs.length);
                      const isToday = key === dateKey(TODAY);
                      const isSunday = day.getDay() === 0;
                      const isSaturday = day.getDay() === 6;

                      return (
                        <div
                          key={key}
                          className={`min-h-[178px] min-w-0 overflow-hidden border-b border-r border-[#e9edf2] bg-white px-2.5 py-3 ${
                            !inCurrentMonth ? "bg-[#fafbfc]" : ""
                          }`}
                        >
                          <div
                            className={`inline-grid h-7 min-w-7 place-items-center px-2 text-[14px] font-medium ${
                              isToday
                                ? "bg-[#1b1f25] text-white"
                                : !inCurrentMonth
                                  ? "text-[#c4cad3]"
                                  : isSunday
                                    ? "text-[#e95544]"
                                    : isSaturday
                                      ? "text-[#337ddf]"
                                      : "text-[#3d4652]"
                            }`}
                          >
                            {day.getDate()}
                          </div>

                          <div className="mt-4 grid min-w-0 gap-1.5">
                            {visibleJobs.map((job) => (
                              <CalendarJobChip key={job.id} job={job} />
                            ))}
                            {hiddenCount > 0 ? (
                              <button
                                type="button"
                                className="h-7 bg-[#eef0f2] text-[12px] font-medium text-[#3f4651] hover:bg-[#e2e6ea]"
                                onClick={() =>
                                  setMoreJobs({
                                    dateLabel: `${visibleMonth.getFullYear()}년 ${visibleMonth.getMonth() + 1}월 ${day.getDate()}일`,
                                    jobs: dayJobs,
                                  })
                                }
                              >
                                +{hiddenCount} 더보기
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="min-[761px]:hidden">
                <MiniMonthCalendar
                  days={days}
                  visibleMonthIndex={visibleMonth.getMonth()}
                  jobsByDate={jobsByDate}
                  selectedDateKey={selectedDateKey}
                  onSelectDate={setSelectedDateKey}
                />

                <div className="border-t border-[#e7ebef] px-4 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#1f252d]">{formatDayLabel(selectedDateKey)}</h3>
                    {selectedDayJobs.length > 0 ? (
                      <span className="shrink-0 text-[12px] font-medium text-[#8a93a1]">{selectedDayJobs.length}건</span>
                    ) : null}
                  </div>

                  {selectedDayJobs.length > 0 ? (
                    <CalendarDayJobList jobs={selectedDayJobs} className="mt-3" />
                  ) : (
                    <div className="mt-3 border border-dashed border-[#dfe4eb] bg-[#fbfcfd] px-4 py-5 text-center">
                      <p className="text-[13px] font-medium text-[#6b7280]">이 날은 일정이 없어요</p>
                      {nextEventDateKey ? (
                        <button
                          type="button"
                          className="mt-1 inline-flex min-h-[40px] items-center text-[13px] font-medium text-[#111111] underline underline-offset-4"
                          onClick={() => setSelectedDateKey(nextEventDateKey)}
                        >
                          다음 일정: {formatDayLabel(nextEventDateKey)}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 캘린더 탭 진입자의 1차 기대는 캘린더 — 지원 일정 요약은 대시보드와 중복이라 캘린더 아래로 (H2, 2026.08 모바일 사이클) */}
            {/* min-w-0: .jobs-layout의 ≤1180px 오버라이드가 minmax(0,1fr)이 아닌 1fr이라, 기본 min-width:auto면 가로 스크롤 카드 행이 열을 밀어 페이지가 넘친다 */}
            {appliedJobsCount > 0 ? (
              <UpcomingApplicationsSection jobs={appliedJobs} totalCount={appliedJobsCount} className="min-w-0 min-[761px]:hidden" />
            ) : null}

            <aside className="grid content-start gap-5">
              <InterestConditionCard
                chips={interestConditionChips}
                emptyStateText={
                  <>
                    관심조건을 설정해두면 원하는 공고만
                    <br />
                    빠르게 확인할 수 있어요.
                  </>
                }
                summaryText="관심조건에 맞는 공고만 빠르게 확인할 수 있어요."
                applied={interestConditionApplied}
                primaryCtaLabel="내 관심 조건 적용"
                primaryCtaAppliedLabel="관심조건 해제"
                onPrimaryCtaClick={interestConditionApplied ? clearInterestCondition : applyInterestCondition}
                secondaryActionLabel="관심 조건 수정"
                secondaryActionHref={sharedRoutes.myPagePreferences}
                bottomSlot={
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-4 text-[13px] font-medium text-gray-500">
                    <MailCheck size={15} className="text-gray-700" />
                    {emailAlertOn ? (
                      "이메일 알림 사용 중"
                    ) : (
                      <>
                        이메일 알림 꺼짐
                        <Link href={sharedRoutes.myPagePreferences} className="text-[13px] font-medium text-[#111111] hover:underline">
                          알림 켜기
                        </Link>
                      </>
                    )}
                  </div>
                }
              />

              <JobUsageTipsCard
                savedCount={tabCounts.saved}
                onSavedClick={showSavedJobs}
                onRecentClick={showRecentJobs}
                onPreferenceSettingsClick={goToPreferences}
              />
            </aside>
          </div>
        </div>
      </main>

      {loginModalOpen ? (
        <LoginGateModal
          ariaLabel="채용 캘린더 로그인 안내"
          description="내 스크랩한 공고, 지원 현황, 다른 달 이동은 회원 기능입니다. 로그인 후 채용 마감 일정을 이어서 확인할 수 있습니다."
          onClose={() => setLoginModalOpen(false)}
          onLogin={() => {
            login();
            setLoginModalOpen(false);
          }}
        />
      ) : null}

      {moreJobs ? <MoreJobsModal dateLabel={moreJobs.dateLabel} jobs={moreJobs.jobs} onClose={() => setMoreJobs(null)} /> : null}
    </>
  );
}
