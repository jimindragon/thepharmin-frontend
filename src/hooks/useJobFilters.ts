"use client";

import { useEffect, useMemo, useState } from "react";
import {
  educationRank,
  experienceOptions,
  hourlyPayRangeOptions,
  optionLabelMaps,
  salaryOptions,
  trackFilterConfigs,
} from "@/config/jobFilters/index";
import type {
  AppliedFilterChip,
  FilterKind,
  FilterStateKey,
  Job,
  JobFilters,
  SpecialJobFilterKey,
  JobTrack,
  SingleFilterStateKey,
  UserJobPreference,
} from "@/types/jobs";

const trackIds: JobTrack[] = ["industry", "research", "pharmacy", "hospital"];

const arrayFilterKeys: FilterStateKey[] = [
  "regionIds",
  "employmentTypeIds",
  "companyTypeIds",
  "workModeIds",
  "institutionTypeIds",
  "contractPeriodIds",
  "workTypeIds",
  "pharmacyFeatureIds",
  "scheduleIds",
  "hospitalTypeIds",
  "shiftTypeIds",
];

const singleFilterKeys: SingleFilterStateKey[] = ["experienceId", "educationId", "salaryId", "hourlyPayRangeId"];

const queryKeys = {
  jobCategoryIds: "jobCategory",
  jobSubcategoryIds: "job",
  regionIds: "region",
  employmentTypeIds: "employment",
  companyTypeIds: "companyType",
  workModeIds: "workMode",
  institutionTypeIds: "institution",
  contractPeriodIds: "contract",
  workTypeIds: "workType",
  pharmacyFeatureIds: "pharmacyFeature",
  scheduleIds: "schedule",
  hospitalTypeIds: "hospitalType",
  shiftTypeIds: "shift",
  experienceId: "experience",
  educationId: "education",
  salaryId: "salary",
  hourlyPayRangeId: "pay",
} as const;

const chipDefinitions: Array<{
  kind: FilterKind;
  key: keyof JobFilters;
  labelMapKey: string;
  multiple: boolean;
}> = [
  { kind: "jobCategory", key: "jobCategoryIds", labelMapKey: "jobCategory", multiple: true },
  { kind: "jobSubcategory", key: "jobSubcategoryIds", labelMapKey: "jobSubcategory", multiple: true },
  { kind: "region", key: "regionIds", labelMapKey: "region", multiple: true },
  { kind: "experience", key: "experienceId", labelMapKey: "experience", multiple: false },
  { kind: "education", key: "educationId", labelMapKey: "education", multiple: false },
  { kind: "employmentType", key: "employmentTypeIds", labelMapKey: "employmentType", multiple: true },
  { kind: "salary", key: "salaryId", labelMapKey: "salary", multiple: false },
  { kind: "workMode", key: "workModeIds", labelMapKey: "workMode", multiple: true },
  { kind: "companyType", key: "companyTypeIds", labelMapKey: "companyType", multiple: true },
  { kind: "institutionType", key: "institutionTypeIds", labelMapKey: "institutionType", multiple: true },
  { kind: "contractPeriod", key: "contractPeriodIds", labelMapKey: "contractPeriod", multiple: true },
  { kind: "workType", key: "workTypeIds", labelMapKey: "workType", multiple: true },
  { kind: "hourlyPay", key: "hourlyPayRangeId", labelMapKey: "hourlyPay", multiple: false },
  { kind: "pharmacyFeature", key: "pharmacyFeatureIds", labelMapKey: "pharmacyFeature", multiple: true },
  { kind: "schedule", key: "scheduleIds", labelMapKey: "schedule", multiple: true },
  { kind: "hospitalType", key: "hospitalTypeIds", labelMapKey: "hospitalType", multiple: true },
  { kind: "shiftType", key: "shiftTypeIds", labelMapKey: "shiftType", multiple: true },
];

export const emptyJobFilters: JobFilters = {
  track: "industry",
  keyword: "",
  jobCategoryIds: [],
  jobSubcategoryIds: [],
  experienceId: null,
  educationId: null,
  regionIds: [],
  employmentTypeIds: [],
  salaryId: null,
  workModeIds: [],
  companyTypeIds: [],
  institutionTypeIds: [],
  contractPeriodIds: [],
  workTypeIds: [],
  hourlyPayRangeId: null,
  pharmacyFeatureIds: [],
  scheduleIds: [],
  hospitalTypeIds: [],
  shiftTypeIds: [],
  leaderOnly: false,
  headhuntingOnly: false,
  quickApplyOnly: false,
  hourlyIncludeUnknown: false,
  salaryIncludeUnknown: false,
};

function without<T>(items: T[], value: T) {
  return items.filter((item) => item !== value);
}

function toggleId(items: string[], id: string) {
  return items.includes(id) ? without(items, id) : [...items, id];
}

function csv(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function parseTrack(value: string | null): JobTrack {
  return value && trackIds.includes(value as JobTrack) ? (value as JobTrack) : "industry";
}

function normalizeRegionIdsForTrack(track: JobTrack, regionIds: string[]) {
  return track === "pharmacy" || track === "hospital" ? regionIds.filter((id) => id !== "overseas") : regionIds;
}

function jobCategoriesForTrack(track: JobTrack) {
  return trackFilterConfigs[track].filters.find((definition) => definition.kind === "job")?.categories ?? [];
}

function subcategoryIdsForCategory(track: JobTrack, categoryId: string) {
  return jobCategoriesForTrack(track).find((category) => category.id === categoryId)?.subcategories.map((item) => item.id) ?? [];
}

function categoryIdForSubcategory(track: JobTrack, subcategoryId: string) {
  for (const category of jobCategoriesForTrack(track)) {
    if (category.subcategories.some((subcategory) => subcategory.id === subcategoryId)) {
      return category.id;
    }
  }

  return null;
}

function parseFiltersFromQuery(): JobFilters {
  if (typeof window === "undefined") return emptyJobFilters;

  const params = new URLSearchParams(window.location.search);
  const next: JobFilters = {
    ...emptyJobFilters,
    track: parseTrack(params.get("track")),
    keyword: params.get("keyword") ?? "",
    jobCategoryIds: csv(params.get("jobCategory")),
    jobSubcategoryIds: csv(params.get("job")),
    leaderOnly: params.get("leader") === "true",
    headhuntingOnly: params.get("headhunting") === "true",
    quickApplyOnly: params.get("quickApply") === "true",
    hourlyIncludeUnknown: params.get("hourlyUnknown") === "true",
    salaryIncludeUnknown: params.get("salaryUnknown") === "true",
  };

  arrayFilterKeys.forEach((key) => {
    const queryKey = queryKeys[key];
    next[key] = csv(params.get(queryKey));
  });

  singleFilterKeys.forEach((key) => {
    const queryKey = queryKeys[key];
    next[key] = params.get(queryKey);
  });

  next.regionIds = normalizeRegionIdsForTrack(next.track, next.regionIds);

  return next;
}

export function preserveCommonFiltersForTrackChange(current: JobFilters, nextTrack: JobTrack): JobFilters {
  return {
    ...emptyJobFilters,
    track: nextTrack,
    keyword: current.keyword,
    regionIds: normalizeRegionIdsForTrack(nextTrack, current.regionIds),
    leaderOnly: current.leaderOnly,
    headhuntingOnly: current.headhuntingOnly,
    quickApplyOnly: current.quickApplyOnly,
  };
}

function makeChip(kind: FilterKind, id: string, label: string): AppliedFilterChip {
  return {
    key: `${kind}:${id}`,
    kind,
    id,
    label,
  };
}

/** `useJobFilters`의 적용된 칩 계산과 마이페이지 관심조건 설정 화면이 함께 쓰는 순수 함수. */
export function buildAppliedChips(filters: JobFilters): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = [];

  chipDefinitions.forEach((definition) => {
    const value = filters[definition.key];
    if (definition.multiple) {
      (value as string[]).forEach((id) => {
        const label = optionLabelMaps[definition.labelMapKey]?.get(id) ?? id;
        chips.push(makeChip(definition.kind, id, definition.kind === "jobCategory" ? `${label} 전체` : label));
      });
      return;
    }

    if (typeof value === "string" && value) {
      chips.push(makeChip(definition.kind, value, optionLabelMaps[definition.labelMapKey]?.get(value) ?? value));
    }
  });

  if (filters.keyword.trim()) {
    chips.push(makeChip("keyword", filters.keyword.trim(), `검색어: ${filters.keyword.trim()}`));
  }

  if (filters.leaderOnly) {
    chips.push(makeChip("leaderOnly", "true", "리더급 공고"));
  }

  if (filters.headhuntingOnly) {
    chips.push(makeChip("headhuntingOnly", "true", "헤드헌팅 공고"));
  }

  if (filters.quickApplyOnly) {
    chips.push(makeChip("quickApplyOnly", "true", "간편지원 공고"));
  }

  if (filters.hourlyIncludeUnknown) {
    chips.push(makeChip("hourlyIncludeUnknown", "true", "시급 미표기 포함"));
  }

  if (filters.salaryIncludeUnknown) {
    chips.push(makeChip("salaryIncludeUnknown", "true", "급여 미표기 포함"));
  }

  return chips;
}

/** 직무 1차 분류 토글의 순수 버전. 같은 트랙 안에서 분류를 켜고 끄면 하위 직무 선택도 함께 정리한다. */
export function toggleJobCategoryInFilters(filters: JobFilters, id: string): JobFilters {
  const subcategoryIds = subcategoryIdsForCategory(filters.track, id);
  const selected = filters.jobCategoryIds.includes(id);

  return {
    ...filters,
    jobCategoryIds: selected ? without(filters.jobCategoryIds, id) : [...filters.jobCategoryIds, id],
    jobSubcategoryIds: filters.jobSubcategoryIds.filter((subcategoryId) => !subcategoryIds.includes(subcategoryId)),
  };
}

/** 직무 2차 분류 토글의 순수 버전. */
export function toggleJobSubcategoryInFilters(filters: JobFilters, id: string): JobFilters {
  const categoryId = categoryIdForSubcategory(filters.track, id);

  if (filters.jobSubcategoryIds.includes(id)) {
    return { ...filters, jobSubcategoryIds: without(filters.jobSubcategoryIds, id) };
  }

  return {
    ...filters,
    jobCategoryIds: categoryId ? without(filters.jobCategoryIds, categoryId) : filters.jobCategoryIds,
    jobSubcategoryIds: [...filters.jobSubcategoryIds, id],
  };
}

/** 칩 하나를 걷어낸 필터를 돌려주는 순수 버전. `keyword` 칩은 호출부에서 `keywordInput` UI 상태도 함께 비워야 한다. */
export function removeChipFromFilters(filters: JobFilters, chip: AppliedFilterChip): JobFilters {
  if (chip.kind === "keyword") {
    return { ...filters, keyword: "" };
  }

  if (chip.kind === "headhuntingOnly") {
    return { ...filters, headhuntingOnly: false };
  }

  if (chip.kind === "leaderOnly") {
    return { ...filters, leaderOnly: false };
  }

  if (chip.kind === "quickApplyOnly") {
    return { ...filters, quickApplyOnly: false };
  }

  if (chip.kind === "hourlyIncludeUnknown") {
    return { ...filters, hourlyIncludeUnknown: false };
  }

  if (chip.kind === "salaryIncludeUnknown") {
    return { ...filters, salaryIncludeUnknown: false };
  }

  if (chip.kind === "jobCategory") {
    const subcategoryIds = subcategoryIdsForCategory(filters.track, chip.id);
    return {
      ...filters,
      jobCategoryIds: without(filters.jobCategoryIds, chip.id),
      jobSubcategoryIds: filters.jobSubcategoryIds.filter((subcategoryId) => !subcategoryIds.includes(subcategoryId)),
    };
  }

  const definition = chipDefinitions.find((item) => item.kind === chip.kind);
  if (!definition) return filters;

  if (definition.multiple) {
    const key = definition.key as FilterStateKey;
    return { ...filters, [key]: without(filters[key], chip.id) };
  }

  return { ...filters, [definition.key]: null };
}

function hasActiveFilters(filters: JobFilters) {
  return (
    filters.keyword.trim().length > 0 ||
    filters.jobCategoryIds.length > 0 ||
    filters.jobSubcategoryIds.length > 0 ||
    filters.experienceId !== null ||
    filters.educationId !== null ||
    filters.regionIds.length > 0 ||
    filters.employmentTypeIds.length > 0 ||
    filters.salaryId !== null ||
    filters.workModeIds.length > 0 ||
    filters.companyTypeIds.length > 0 ||
    filters.institutionTypeIds.length > 0 ||
    filters.contractPeriodIds.length > 0 ||
    filters.workTypeIds.length > 0 ||
    filters.hourlyPayRangeId !== null ||
    filters.pharmacyFeatureIds.length > 0 ||
    filters.scheduleIds.length > 0 ||
    filters.hospitalTypeIds.length > 0 ||
    filters.shiftTypeIds.length > 0 ||
    filters.leaderOnly ||
    filters.headhuntingOnly ||
    filters.quickApplyOnly ||
    filters.hourlyIncludeUnknown ||
    filters.salaryIncludeUnknown
  );
}

function toQuery(filters: JobFilters) {
  const params = new URLSearchParams();

  params.set("track", filters.track);
  if (filters.jobCategoryIds.length) params.set("jobCategory", filters.jobCategoryIds.join(","));
  if (filters.jobSubcategoryIds.length) params.set("job", filters.jobSubcategoryIds.join(","));
  if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
  if (filters.leaderOnly) params.set("leader", "true");
  if (filters.headhuntingOnly) params.set("headhunting", "true");
  if (filters.quickApplyOnly) params.set("quickApply", "true");
  if (filters.hourlyIncludeUnknown) params.set("hourlyUnknown", "true");
  if (filters.salaryIncludeUnknown) params.set("salaryUnknown", "true");

  arrayFilterKeys.forEach((key) => {
    if (filters[key].length) params.set(queryKeys[key], filters[key].join(","));
  });

  singleFilterKeys.forEach((key) => {
    const value = filters[key];
    if (value) params.set(queryKeys[key], value);
  });

  return params.toString();
}

function rangeOverlaps(jobMin: number, jobMax: number | null, selectedMin: number | null, selectedMax: number | null) {
  if (selectedMin === null && selectedMax === null) return true;

  const actualJobMax = jobMax ?? Number.POSITIVE_INFINITY;
  const actualSelectedMax = selectedMax ?? Number.POSITIVE_INFINITY;
  const actualSelectedMin = selectedMin ?? 0;

  return jobMin <= actualSelectedMax && actualJobMax >= actualSelectedMin;
}

function includesAny(source: string[] | undefined, targets: string[]) {
  return targets.length === 0 || Boolean(source?.some((item) => targets.includes(item)));
}

function jobEmploymentTypeIds(job: Job) {
  return job.employmentTypeIds ?? [job.employmentTypeId];
}

function hourlyPayRange(id: string | null) {
  if (!id) return null;
  if (id === "under-25000") return { min: null, max: 25000 };
  if (id === "25000-30000") return { min: 25000, max: 30000 };
  if (id === "30000-35000") return { min: 30000, max: 35000 };
  if (id === "35000-40000") return { min: 35000, max: 40000 };
  if (id === "40000-plus") return { min: 40000, max: null };
  return null;
}

function hourlyPayMatches(job: Job, hourlyPayRangeId: string | null, includeUnknown: boolean) {
  const selected = hourlyPayRange(hourlyPayRangeId);
  if (!selected) return true;

  const computed = job.salaryDetail?.hourlyComputed;
  if (!computed) return includeUnknown;

  const jobMin = computed.min ?? computed.max ?? 0;
  const jobMax = computed.max ?? computed.min ?? jobMin;
  const selectedMin = selected.min ?? 0;
  const selectedMax = selected.max ?? Number.POSITIVE_INFINITY;

  return jobMin <= selectedMax && jobMax >= selectedMin;
}

function jobCategoryMatches(job: Job, filters: JobFilters) {
  if (filters.jobCategoryIds.length === 0 && filters.jobSubcategoryIds.length === 0) return true;
  if (filters.jobSubcategoryIds.length > 0 && includesAny(job.jobSubcategoryIds, filters.jobSubcategoryIds)) return true;

  const categoryIds = new Set(job.jobSubcategoryIds.map((id) => categoryIdForSubcategory(filters.track, id)).filter(Boolean));
  return filters.jobCategoryIds.some((id) => categoryIds.has(id));
}

interface UseJobFiltersOptions {
  syncUrl?: boolean;
  basePath?: string;
}

export function useJobFilters(initialPreferenceApplied = false, options: UseJobFiltersOptions = {}) {
  const syncUrl = options.syncUrl ?? true;
  const basePath = options.basePath ?? "/jobs";
  const [filters, setFilters] = useState<JobFilters>(emptyJobFilters);
  const [keywordInput, setKeywordInput] = useState("");
  const [jobLimitMessage, setJobLimitMessage] = useState("");
  const [preferenceApplied, setPreferenceApplied] = useState(initialPreferenceApplied);
  const [queryReady, setQueryReady] = useState(false);

  useEffect(() => {
    const parsedFilters = parseFiltersFromQuery();
    setFilters(parsedFilters);
    setKeywordInput(parsedFilters.keyword);
    setQueryReady(true);
  }, []);

  useEffect(() => {
    if (!queryReady || !syncUrl) return;
    const query = toQuery(filters);
    const nextUrl = query ? `${basePath}?${query}` : basePath;
    window.history.replaceState(null, "", nextUrl);
  }, [basePath, filters, queryReady, syncUrl]);

  const appliedChips = useMemo(() => buildAppliedChips(filters), [filters]);

  const markManualChange = () => {
    setPreferenceApplied(false);
  };

  const setTrack = (track: JobTrack) => {
    setJobLimitMessage("");
    setPreferenceApplied(false);
    setFilters((current) => {
      const next = preserveCommonFiltersForTrackChange(current, track);
      setKeywordInput(next.keyword);
      return next;
    });
  };

  const toggleJobCategory = (id: string) => {
    setJobLimitMessage("");
    markManualChange();
    setFilters((current) => toggleJobCategoryInFilters(current, id));
  };

  const toggleJobSubcategory = (id: string) => {
    setJobLimitMessage("");
    markManualChange();
    setFilters((current) => toggleJobSubcategoryInFilters(current, id));
  };

  const toggleMultiFilter = (key: FilterStateKey, id: string) => {
    markManualChange();
    setFilters((current) => ({ ...current, [key]: toggleId(current[key], id) }));
  };

  const setSingleFilter = (key: SingleFilterStateKey, id: string | null) => {
    markManualChange();
    setFilters((current) => ({
      ...current,
      [key]: id === "any" || current[key] === id ? null : id,
    }));
  };

  const toggleRegion = (id: string) => {
    toggleMultiFilter("regionIds", id);
  };

  const setMetropolitanRegions = () => {
    markManualChange();
    setFilters((current) => ({
      ...current,
      regionIds: Array.from(new Set([...current.regionIds, "seoul", "gyeonggi", "incheon"])),
    }));
  };

  const clearRegions = () => {
    markManualChange();
    setFilters((current) => ({ ...current, regionIds: [] }));
  };

  const setExperience = (id: string) => setSingleFilter("experienceId", id);
  const setEducation = (id: string | null) => setSingleFilter("educationId", id);
  const toggleEmploymentType = (id: string) => toggleMultiFilter("employmentTypeIds", id);
  const setSalary = (id: string | null) => setSingleFilter("salaryId", id);
  const toggleWorkMode = (id: string) => toggleMultiFilter("workModeIds", id);
  const toggleCompanyType = (id: string) => toggleMultiFilter("companyTypeIds", id);

  const setSpecialFilter = (key: SpecialJobFilterKey, checked: boolean) => {
    markManualChange();
    setFilters((current) => ({ ...current, [key]: checked }));
  };

  const submitKeyword = () => {
    markManualChange();
    setFilters((current) => ({ ...current, keyword: keywordInput.trim() }));
  };

  const removeAppliedFilter = (chip: AppliedFilterChip) => {
    markManualChange();
    if (chip.kind === "keyword") {
      setKeywordInput("");
    }
    setFilters((current) => removeChipFromFilters(current, chip));
  };

  const resetFilters = () => {
    setFilters({ ...emptyJobFilters, track: filters.track });
    setKeywordInput("");
    setJobLimitMessage("");
    setPreferenceApplied(false);
  };

  /**
   * 관심조건을 현재 트랙의 필터에 덧씌운다. 트랙은 페이지의 기본 범위 조건이므로 절대 바꾸지 않고
   * `current.track`을 그대로 유지한다 — 관심조건과 트랙 범위는 서로 분리된 별개의 조건이다.
   */
  const applyPreference = (preference: UserJobPreference) => {
    setFilters((current) => ({
      ...emptyJobFilters,
      track: current.track,
      jobCategoryIds: preference.jobCategoryIds,
      jobSubcategoryIds: preference.jobSubcategoryIds,
      experienceId: preference.experienceId,
      educationId: preference.educationId,
      regionIds: normalizeRegionIdsForTrack(current.track, preference.regionIds),
      employmentTypeIds: preference.employmentTypeIds,
      salaryId: preference.salaryId,
      workModeIds: preference.workModeIds,
      companyTypeIds: preference.companyTypeIds,
      institutionTypeIds: preference.institutionTypeIds,
      contractPeriodIds: preference.contractPeriodIds,
      workTypeIds: preference.workTypeIds,
      hourlyPayRangeId: preference.hourlyPayRangeId,
      pharmacyFeatureIds: preference.pharmacyFeatureIds,
      scheduleIds: preference.scheduleIds,
      hospitalTypeIds: preference.hospitalTypeIds,
      shiftTypeIds: preference.shiftTypeIds,
    }));
    setKeywordInput("");
    setJobLimitMessage("");
    setPreferenceApplied(true);
  };

  /** 관심조건으로 들어온 값만 걷어내고, 트랙을 포함한 나머지 상태는 그대로 둔다. */
  const clearPreferenceFilters = (preference: UserJobPreference | null) => {
    if (!preference) {
      setPreferenceApplied(false);
      return;
    }

    setFilters((current) => ({
      ...current,
      jobCategoryIds: current.jobCategoryIds.filter((id) => !preference.jobCategoryIds.includes(id)),
      jobSubcategoryIds: current.jobSubcategoryIds.filter((id) => !preference.jobSubcategoryIds.includes(id)),
      experienceId: current.experienceId === preference.experienceId ? null : current.experienceId,
      educationId: current.educationId === preference.educationId ? null : current.educationId,
      regionIds: current.regionIds.filter((id) => !preference.regionIds.includes(id)),
      employmentTypeIds: current.employmentTypeIds.filter((id) => !preference.employmentTypeIds.includes(id)),
      salaryId: current.salaryId === preference.salaryId ? null : current.salaryId,
      workModeIds: current.workModeIds.filter((id) => !preference.workModeIds.includes(id)),
      companyTypeIds: current.companyTypeIds.filter((id) => !preference.companyTypeIds.includes(id)),
      institutionTypeIds: current.institutionTypeIds.filter((id) => !preference.institutionTypeIds.includes(id)),
      contractPeriodIds: current.contractPeriodIds.filter((id) => !preference.contractPeriodIds.includes(id)),
      workTypeIds: current.workTypeIds.filter((id) => !preference.workTypeIds.includes(id)),
      hourlyPayRangeId: current.hourlyPayRangeId === preference.hourlyPayRangeId ? null : current.hourlyPayRangeId,
      pharmacyFeatureIds: current.pharmacyFeatureIds.filter((id) => !preference.pharmacyFeatureIds.includes(id)),
      scheduleIds: current.scheduleIds.filter((id) => !preference.scheduleIds.includes(id)),
      hospitalTypeIds: current.hospitalTypeIds.filter((id) => !preference.hospitalTypeIds.includes(id)),
      shiftTypeIds: current.shiftTypeIds.filter((id) => !preference.shiftTypeIds.includes(id)),
    }));
    setPreferenceApplied(false);
  };

  return {
    filters,
    keywordInput,
    jobLimitMessage,
    appliedChips,
    preferenceApplied,
    hasActiveFilters: hasActiveFilters(filters),
    setKeywordInput,
    setTrack,
    toggleJobCategory,
    toggleJobSubcategory,
    toggleMultiFilter,
    setSingleFilter,
    toggleRegion,
    setMetropolitanRegions,
    clearRegions,
    setExperience,
    setEducation,
    toggleEmploymentType,
    setSalary,
    toggleWorkMode,
    toggleCompanyType,
    setSpecialFilter,
    submitKeyword,
    removeAppliedFilter,
    resetFilters,
    applyPreference,
    clearPreferenceFilters,
    setPreferenceApplied,
  };
}

interface FilterJobsOptions {
  /** 메인 홈의 "전체 분야" 목록처럼 트랙 구분 없이 모든 분야를 보여줄 때 false로 넘긴다. */
  matchTrack?: boolean;
}

export function filterJobsByFilters(items: Job[], filters: JobFilters, options: FilterJobsOptions = {}) {
  const matchTrack = options.matchTrack ?? true;
  const experience = filters.experienceId
    ? experienceOptions.find((option) => option.id === filters.experienceId)
    : null;
  const salary = filters.salaryId ? salaryOptions.find((option) => option.id === filters.salaryId) : null;
  const selectedEducationRank = filters.educationId ? educationRank[filters.educationId] : null;
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((job) => {
    if (matchTrack && job.track !== filters.track) return false;
    if (filters.leaderOnly && (job.experienceMin ?? 0) < 5) return false;
    if (filters.headhuntingOnly && job.postingSource !== "headhunting") return false;
    if (filters.quickApplyOnly && job.applyMethod !== "간편 지원" && job.applyMethod !== "더파마 간편지원") return false;
    if (!jobCategoryMatches(job, filters)) return false;
    if (filters.regionIds.length && !filters.regionIds.includes(job.regionId)) return false;
    if (filters.employmentTypeIds.length && !includesAny(jobEmploymentTypeIds(job), filters.employmentTypeIds)) return false;
    if (filters.workModeIds.length && !includesAny(job.workModeIds, filters.workModeIds)) return false;
    if (filters.companyTypeIds.length && !filters.companyTypeIds.includes(job.companyTypeId)) return false;
    if (filters.institutionTypeIds.length && !includesAny(job.researchInstitutionTypeIds, filters.institutionTypeIds)) return false;
    if (filters.contractPeriodIds.length && !includesAny(job.contractPeriodIds, filters.contractPeriodIds)) return false;
    if (filters.workTypeIds.length && !includesAny(job.pharmacyWorkTypeIds, filters.workTypeIds)) return false;
    if (filters.pharmacyFeatureIds.length && !includesAny(job.pharmacyFeatureIds, filters.pharmacyFeatureIds)) return false;
    if (filters.scheduleIds.length && !includesAny(job.scheduleIds, filters.scheduleIds)) return false;
    if (filters.hospitalTypeIds.length && !includesAny(job.hospitalTypeIds ?? (job.hospitalTypeId ? [job.hospitalTypeId] : []), filters.hospitalTypeIds)) return false;
    if (filters.shiftTypeIds.length && !includesAny(job.shiftTypeIds, filters.shiftTypeIds)) return false;
    if (!hourlyPayMatches(job, filters.hourlyPayRangeId, filters.hourlyIncludeUnknown)) return false;

    if (experience && !rangeOverlaps(job.experienceMin, job.experienceMax, experience.min, experience.max)) {
      return false;
    }

    if (selectedEducationRank !== null && educationRank[job.educationId] < selectedEducationRank) {
      return false;
    }

    if (salary && !(filters.salaryIncludeUnknown && job.salaryMin === null)) {
      if (salary.id === "company-policy" && job.salaryMin !== null) return false;
      if (salary.min !== null && (job.salaryMax ?? job.salaryMin ?? 0) < salary.min) return false;
    }

    if (keyword) {
      const haystack = [
        job.company,
        job.title,
        job.location,
        job.career,
        job.education,
        job.employmentType,
        job.salary,
        job.industry ?? "",
        ...job.tags,
        ...job.searchKeywords,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });
}

export const filterOptionCollections = {
  hourlyPayRangeOptions,
};
