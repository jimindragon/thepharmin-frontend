"use client";

import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Filter,
  Lock,
  MailCheck,
  Pin,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hospitalTypeOptions } from "@/config/jobFilters/hospitalFilters";
import { industryJobCategoryOptions } from "@/config/jobFilters/industryFilters";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { researchInstitutionTypeOptions, researchJobCategoryOptions } from "@/config/jobFilters/researchFilters";
import { companyTypeOptions, experienceOptions } from "@/config/jobFilters/shared";
import { PageHeader } from "@/components/PageHeader";
import { sharedRoutes } from "@/config/routes";
import { calendarJobs, type CalendarEventType, type CalendarJob, type CalendarJobStage } from "@/data/calendar";
import type { FilterOption, JobCategoryOption, JobTrack } from "@/types/jobs";

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

const TODAY = new Date(2026, 5, 21);
const DEFAULT_YEAR = 2026;
const DEFAULT_MONTH = 5;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ALL_JOB_CATEGORY_ID = "__all";

const tabs: Array<{ id: CalendarTab; label: string }> = [
  { id: "all", label: "전체 공고" },
  { id: "saved", label: "관심 공고" },
  { id: "applied", label: "지원한 공고" },
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

const eventTypeStyles: Record<CalendarEventType, { marker: string; dot: string }> = {
  deadline: {
    marker: "bg-[#e95544]",
    dot: "bg-[#e95544]",
  },
  start: {
    marker: "bg-[#337ddf]",
    dot: "bg-[#337ddf]",
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

const stageLabels: Record<CalendarJobStage, string> = {
  applied: "지원완료",
  screening: "서류전형",
  interview: "면접",
  result: "결과",
};

const stageOrder: CalendarJobStage[] = ["applied", "screening", "interview", "result"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - firstDay.getDay());
  const end = new Date(year, month + 1, lastDay.getDay() === 6 ? 0 : 6 - lastDay.getDay());
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function getStageIndex(stage?: CalendarJobStage) {
  if (!stage) return 0;
  return Math.max(0, stageOrder.indexOf(stage));
}

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

function deriveIndustryJobFacet(job: CalendarJob) {
  const directMap: Record<string, { categoryIds: string[]; subcategoryIds: string[] }> = {
    ra: { categoryIds: ["regulatory"], subcategoryIds: ["ra", "regulatory-strategy"] },
    "qa-qc": { categoryIds: ["production-quality"], subcategoryIds: ["qa", "qc"] },
    clinical: { categoryIds: ["clinical"], subcategoryIds: ["clinical-ops", "crc"] },
    rnd: { categoryIds: ["rd"], subcategoryIds: ["new-drug"] },
    manufacturing: { categoryIds: ["production-quality"], subcategoryIds: ["manufacturing"] },
    pv: { categoryIds: ["pharmacy-safety"], subcategoryIds: ["pv-drug-safety"] },
    "sales-marketing": { categoryIds: ["sales-marketing"], subcategoryIds: ["marketing-pm", "sales-planning"] },
  };

  return directMap[job.jobCategoryId] ?? { categoryIds: [], subcategoryIds: [] };
}

function deriveCompanyTypeIds(job: CalendarJob) {
  const name = job.companyName;
  if (name.includes("바이오") || name.includes("셀트리온") || name.includes("녹십자")) return ["biotech"];
  if (name.includes("센서")) return ["medical-device"];
  if (name.includes("CRO")) return ["cro"];
  return ["pharma"];
}

function deriveExperienceId(job: CalendarJob) {
  const title = `${job.title} ${job.role}`;
  if (title.includes("PM") || title.includes("Manager") || title.includes("관리")) return "5-10";
  if (title.includes("QC") || title.includes("QA") || title.includes("MSL")) return "3-5";
  if (title.includes("신입")) return "new";
  return "3-5";
}

function deriveResearchFacet(job: CalendarJob) {
  const categoryId = categoryIdForSubcategory(researchJobCategoryOptions, job.jobCategoryId);
  const institutionTypeIds =
    job.companyName.includes("의대") || job.companyName.includes("학교")
      ? ["university_lab"]
      : job.companyName.includes("병원")
        ? ["hospital_research_institute"]
        : ["national_research_agency", "nonprofit_research_foundation"];

  return {
    categoryIds: categoryId ? [categoryId] : [],
    subcategoryIds: [job.jobCategoryId],
    institutionTypeIds,
  };
}

function deriveHospitalTypeIds(job: CalendarJob) {
  if (job.companyName.includes("서울대병원") || job.companyName.includes("아산병원")) return ["tertiary_general_hospital"];
  return ["hospital"];
}

function derivePharmacyFeatureIds(job: CalendarJob) {
  if (job.companyName.includes("온누리") || job.companyName.includes("그린")) return ["prescription_focused"];
  return ["otc_focused"];
}

function jobMatchesCalendarFilters(job: CalendarJob, filters: CalendarFilterState) {
  if (job.track === "industry") {
    const jobFacet = deriveIndustryJobFacet(job);
    const hasJobFilter = filters.jobCategoryIds.length > 0 || filters.jobSubcategoryIds.length > 0;
    const jobMatched =
      !hasJobFilter ||
      filters.jobCategoryIds.some((id) => jobFacet.categoryIds.includes(id)) ||
      filters.jobSubcategoryIds.some((id) => jobFacet.subcategoryIds.includes(id));
    const companyMatched =
      filters.companyTypeIds.length === 0 || filters.companyTypeIds.some((id) => deriveCompanyTypeIds(job).includes(id));
    const experienceMatched = !filters.experienceId || filters.experienceId === deriveExperienceId(job);
    return jobMatched && companyMatched && experienceMatched;
  }

  if (job.track === "research") {
    const jobFacet = deriveResearchFacet(job);
    const hasJobFilter = filters.jobCategoryIds.length > 0 || filters.jobSubcategoryIds.length > 0;
    const jobMatched =
      !hasJobFilter ||
      filters.jobCategoryIds.some((id) => jobFacet.categoryIds.includes(id)) ||
      filters.jobSubcategoryIds.some((id) => jobFacet.subcategoryIds.includes(id));
    const institutionMatched =
      filters.institutionTypeIds.length === 0 || filters.institutionTypeIds.some((id) => jobFacet.institutionTypeIds.includes(id));
    const experienceMatched = !filters.experienceId || filters.experienceId === deriveExperienceId(job);
    return jobMatched && institutionMatched && experienceMatched;
  }

  if (job.track === "hospital") {
    return filters.hospitalTypeIds.length === 0 || filters.hospitalTypeIds.some((id) => deriveHospitalTypeIds(job).includes(id));
  }

  if (job.track === "pharmacy") {
    return filters.pharmacyFeatureIds.length === 0 || filters.pharmacyFeatureIds.some((id) => derivePharmacyFeatureIds(job).includes(id));
  }

  return false;
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
      href={job.href}
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

function ApplicationStepper({ stage }: { stage?: CalendarJobStage }) {
  const activeIndex = getStageIndex(stage);

  return (
    <div className="mt-4">
      <div className="relative grid grid-cols-4 gap-0">
        <div className="absolute left-[10%] right-[10%] top-[9px] h-[2px] bg-[#e7ebef]" />
        <div
          className="absolute left-[10%] top-[9px] h-[2px] bg-[#111111]"
          style={{ width: `${Math.min(activeIndex, 3) * 26.6}%` }}
        />
        {stageOrder.map((item, index) => {
          const active = index <= activeIndex;
          return (
            <div key={item} className="relative z-10 flex flex-col items-center gap-1.5">
              <span className={`h-4 w-4 rounded-full border-[3px] ${active ? "border-[#d8dce2] bg-[#111111]" : "border-[#eef1f4] bg-white"}`} />
              <span className={`text-[10px] font-medium ${active ? "text-[#25303b]" : "text-[#a4acb8]"}`}>
                {stageLabels[item]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationStatusCard({ job }: { job: CalendarJob }) {
  return (
    <Link href="/mypage/applications" className="block border border-[#e5e8ec] bg-white p-3.5 transition hover:border-[#111111] hover:bg-[#fbfbfb]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#1e232b]">{job.companyName}</p>
          <p className="mt-2 truncate text-[12px] font-medium text-[#8b94a2]">{job.title}</p>
        </div>
        {job.statusLabel ? (
          <span
            className={`shrink-0 px-2.5 py-1 text-[12px] font-medium ${
              job.statusLabel.includes("면접") ? "bg-[#f1f3f5] text-[#111111]" : "bg-[#fff0ec] text-[#e95544]"
            }`}
          >
            {job.statusLabel}
          </span>
        ) : null}
      </div>
      <ApplicationStepper stage={job.applicationStage} />
    </Link>
  );
}

function LoginGateModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5" role="dialog" aria-modal="true">
      <div className="w-full max-w-[420px] border border-[#20242b] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="grid h-10 w-10 place-items-center bg-[#111111] text-white">
              <Lock size={18} />
            </div>
            <h2 className="mt-5 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#171b20]">로그인이 필요합니다</h2>
            <p className="mt-3 text-[13px] font-medium leading-6 text-[#7a8490]">
              내 관심 공고, 지원 현황, 다른 달 이동은 회원 기능입니다. 로그인 후 채용 마감 일정을 이어서 확인할 수 있습니다.
            </p>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center hover:bg-[#f2f3f5]" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
          <button type="button" className="h-11 bg-[#111111] px-5 text-[13px] font-medium text-white" onClick={onLogin}>
            로그인하고 보기
          </button>
          <button type="button" className="h-11 border border-[#d9dee5] px-5 text-[13px] font-medium text-[#4b5563]" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5" role="dialog" aria-modal="true">
      <div className="w-full max-w-[520px] border border-[#20242b] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-[#6b7280]">채용 일정</p>
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-[#171b20]">{dateLabel}</h2>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center hover:bg-[#f2f3f5]" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid gap-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={job.href}
              className={`flex min-w-0 items-center justify-between gap-4 border p-3 transition hover:border-[#111111] ${
                job.isBookmarked ? "border-[#c7ced8] bg-[#f6f7f8]" : "border-[#e4e8ee] bg-white"
              }`}
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${eventTypeStyles[eventTypeOf(job)].marker}`} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#222832]">{job.companyName}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-[#87909d]">{job.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecruitmentCalendarClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState<CalendarTab>("all");
  const [visibleMonth, setVisibleMonth] = useState(new Date(DEFAULT_YEAR, DEFAULT_MONTH, 1));
  const [trackFilter, setTrackFilter] = useState<CalendarTrackFilter>("all");
  const [calendarFilters, setCalendarFilters] = useState<CalendarFilterState>(initialCalendarFilters);
  const [eventView, setEventView] = useState<CalendarEventView>("all");
  const [openFilterId, setOpenFilterId] = useState<CalendarFilterId | null>(null);
  const [activeQuickLink, setActiveQuickLink] = useState("preference");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [moreJobs, setMoreJobs] = useState<{ dateLabel: string; jobs: CalendarJob[] } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const guestMode = new URLSearchParams(window.location.search).get("guest") === "true";
    setIsLoggedIn(!guestMode);
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
  const appliedJobs = useMemo(() => availableCalendarJobs.filter((job) => job.isApplied).slice(0, 3), [availableCalendarJobs]);

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
    setVisibleMonth((current) => addMonths(current, amount));
  };

  const moveToday = () => {
    setVisibleMonth(new Date(DEFAULT_YEAR, DEFAULT_MONTH, 1));
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
    setActiveQuickLink("preference");
    setActiveTab("all");
    setTrackFilter("industry");
    setCalendarFilters({
      ...initialCalendarFilters,
      jobSubcategoryIds: ["ra"],
      experienceId: "3-5",
    });
    setOpenFilterId(null);
  };

  const showSavedJobs = () => {
    if (requireLogin()) return;
    setActiveQuickLink("saved");
    setActiveTab("saved");
  };

  const showRecentJobs = () => {
    setActiveQuickLink("recent");
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
          />

          <section className="mt-7 grid grid-cols-3 gap-0 overflow-hidden border border-[#e0e5eb] bg-white p-1.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const privateTab = tab.id !== "all" && !isLoggedIn;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`h-[48px] text-[15px] font-medium transition ${
                    active
                      ? "bg-[#1b1f25] text-white shadow-[0_10px_22px_rgba(17,17,17,0.16)]"
                      : "bg-white text-[#4b535f] hover:bg-[#f6f7f8]"
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`ml-2 inline-flex min-w-[26px] items-center justify-center rounded-full px-2 py-[2px] text-[12px] ${
                      active ? "bg-white/18 text-white" : "bg-[#edf0f3] text-[#8a93a1]"
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                  {privateTab ? <Lock size={13} className="ml-2 inline-block align-[-2px] text-[#a3abb6]" /> : null}
                </button>
              );
            })}
          </section>

          <div className="jobs-layout mt-3.5">
            <section className="overflow-hidden border border-[#e0e5eb] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ebef] px-5 py-5">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center border border-[#dfe4eb] bg-white text-[#5f6875] hover:border-[#1b1f25] hover:text-[#1b1f25]"
                    onClick={() => moveMonth(-1)}
                    aria-label="이전 달"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="min-w-[132px] text-center text-[28px] font-bold tracking-[-0.02em] text-[#20242b]">
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
                  <button
                    type="button"
                    className="h-10 border border-[#dfe4eb] bg-white px-4 text-[13px] font-medium text-[#4d5662] hover:border-[#1b1f25]"
                    onClick={moveToday}
                  >
                    오늘
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#4d5662]">
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
                        className={`inline-flex h-10 items-center gap-2 border px-3.5 transition ${
                          checked ? "border-[#111111] bg-[#111111] text-white" : "border-[#dfe4eb] bg-white text-[#596373] hover:border-[#111111]"
                        }`}
                        onClick={() => setEventView(view.id)}
                        aria-pressed={checked}
                      >
                        {view.id !== "all" ? (
                          <span className={`h-2.5 w-2.5 rounded-full ${eventTypeStyles[view.id].dot}`} />
                        ) : null}
                        {view.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTab === "all" ? (
                <div className="border-b border-[#e7ebef] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {calendarTrackOptions.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          className={`h-10 border px-5 text-[13px] font-medium ${
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
                                <span className={active ? "text-white/72" : "text-[#8a93a1]"}>{summary}</span>
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

              <div className="overflow-x-auto">
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
            </section>

            <aside className="sticky top-5 grid content-start gap-5">
              <section className="surface p-5">
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={applyInterestCondition}
                    className={`flex h-[46px] w-full items-center justify-center gap-2.5 border text-[14px] font-normal transition-all ${
                      activeQuickLink === "preference"
                        ? "border-[#bdbdbd] bg-[#f3f3f3] text-[#111111] ring-2 ring-[rgba(17,17,17,0.12)]"
                        : "border-[#bdbdbd] text-[#111111] hover:bg-[#f3f3f3]"
                    }`}
                  >
                    <Filter size={19} strokeWidth={2.1} />
                    내 관심 조건 적용
                  </button>

                  <button
                    type="button"
                    onClick={showSavedJobs}
                    className={`flex h-[46px] items-center justify-center gap-2.5 border border-[#dfe4ec] text-[14px] font-normal text-[#596373] transition-all hover:border-[#111111] hover:bg-[#f5f5f5] hover:text-[#111111] ${
                      activeQuickLink === "saved" ? "bg-[#f3f3f3] ring-2 ring-[rgba(17,17,17,0.12)]" : ""
                    }`}
                  >
                    <Bookmark size={19} strokeWidth={2} />
                    저장한 공고 {tabCounts.saved}
                  </button>

                  <button
                    type="button"
                    onClick={showRecentJobs}
                    className={`flex h-[46px] items-center justify-center gap-2.5 border border-[#dfe4ec] text-[14px] font-normal text-[#596373] transition-all hover:border-[#111111] hover:bg-[#f5f5f5] hover:text-[#111111] ${
                      activeQuickLink === "recent" ? "bg-[#f3f3f3] ring-2 ring-[rgba(17,17,17,0.12)]" : ""
                    }`}
                  >
                    <Clock3 size={19} strokeWidth={2} />
                    최근 본 공고
                  </button>
                </div>

                <div className="mt-5 border border-[#eef2f6] bg-[#f8fafb] px-5 py-5">
                  <p className="text-[13px] font-medium text-[#8791a0]">내 관심 조건</p>
                  <p className="mt-2 text-[17px] font-normal text-[#252b36]">RA 외 2개</p>
                  <p className="mt-1 text-[13px] font-medium leading-[1.5] text-[#687383]">3~5년 · 서울 · 경기</p>
                  <Link
                    href={sharedRoutes.myPagePreferences}
                    className="mt-4 inline-flex h-[34px] items-center border border-[#d9e1e8] bg-white px-3 text-[13px] font-medium text-[#46505f] hover:border-[#111111] hover:text-[#111111]"
                  >
                    관심 조건 수정
                  </Link>
                  <div className="mt-5 flex items-center gap-2 bg-white px-3 py-2 text-[12px] font-medium text-[#687383]">
                    <MailCheck size={17} className="text-[#111111]" />
                    이메일 알림 사용 중
                  </div>
                </div>
              </section>

              <section className="surface p-5">
                <div className="flex items-center gap-2">
                  <Pin size={16} className="text-[#596373]" />
                  <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#1f252d]">지원 현황</h2>
                </div>
                <p className="mt-2 text-[12px] font-medium leading-5 text-[#8b94a2]">지원한 공고의 다음 일정을 확인합니다.</p>
                <div className="mt-4 grid gap-2.5">
                  {appliedJobs.map((job) => (
                    <ApplicationStatusCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {loginModalOpen ? (
        <LoginGateModal
          onClose={() => setLoginModalOpen(false)}
          onLogin={() => {
            setIsLoggedIn(true);
            setLoginModalOpen(false);
          }}
        />
      ) : null}

      {moreJobs ? <MoreJobsModal dateLabel={moreJobs.dateLabel} jobs={moreJobs.jobs} onClose={() => setMoreJobs(null)} /> : null}
    </>
  );
}
