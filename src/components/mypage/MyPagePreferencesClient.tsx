"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { CategoryTabs } from "@/components/CategoryTabs";
import {
  GroupPanel,
  JobFilterPanel,
  OptionsPanel,
  selectedIds,
  summaryForDefinition,
} from "@/components/SearchFilterPanel";
import { SelectedFilterChips } from "@/components/SelectedFilterChips";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { trackFilterConfigs } from "@/config/jobFilters/index";
import { emptyUserPreference } from "@/data/mockUserPreferences";
import {
  buildAppliedChips,
  emptyJobFilters,
  removeChipFromFilters,
  toggleJobCategoryInFilters,
  toggleJobSubcategoryInFilters,
} from "@/hooks/useJobFilters";
import { getAllStoredJobPreferences, setStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type {
  AppliedFilterChip,
  EmailFrequency,
  FilterStateKey,
  JobFilters,
  JobTrack,
  SingleFilterStateKey,
  TrackPreferences,
  UserJobPreference,
} from "@/types/jobs";

const emailFrequencyOptions: { id: EmailFrequency; label: string }[] = [
  { id: "daily", label: "매일" },
  { id: "twice-weekly", label: "주 2회" },
  { id: "weekly", label: "주 1회" },
];

function isJobTrack(value: string | null): value is JobTrack {
  return value === "industry" || value === "research" || value === "pharmacy" || value === "hospital";
}

function getTrackFromUrl(): JobTrack {
  if (typeof window === "undefined") return "industry";
  const value = new URLSearchParams(window.location.search).get("track");
  return isJobTrack(value) ? value : "industry";
}

/** 관심조건(트랙별 단일 객체)을 해당 트랙의 `JobFilters` 모양으로 펼쳐서, 공고 목록과 동일한 필터 패널 컴포넌트를 그대로 재사용한다. */
function toFullFilters(track: JobTrack, draft: UserJobPreference): JobFilters {
  return {
    ...emptyJobFilters,
    track,
    jobCategoryIds: draft.jobCategoryIds,
    jobSubcategoryIds: draft.jobSubcategoryIds,
    experienceId: draft.experienceId,
    educationId: draft.educationId,
    regionIds: draft.regionIds,
    employmentTypeIds: draft.employmentTypeIds,
    salaryId: draft.salaryId,
    workModeIds: draft.workModeIds,
    companyTypeIds: draft.companyTypeIds,
    institutionTypeIds: draft.institutionTypeIds,
    contractPeriodIds: draft.contractPeriodIds,
    workTypeIds: draft.workTypeIds,
    hourlyPayRangeId: draft.hourlyPayRangeId,
    pharmacyFeatureIds: draft.pharmacyFeatureIds,
    scheduleIds: draft.scheduleIds,
    hospitalTypeIds: draft.hospitalTypeIds,
    shiftTypeIds: draft.shiftTypeIds,
  };
}

/** 위 변환의 역방향. 이메일 알림처럼 필터에 없는 필드는 기존 draft 값을 그대로 들고 온다. */
function mergeFiltersIntoDraft(draft: UserJobPreference, filters: JobFilters): UserJobPreference {
  return {
    ...draft,
    jobCategoryIds: filters.jobCategoryIds,
    jobSubcategoryIds: filters.jobSubcategoryIds,
    experienceId: filters.experienceId,
    educationId: filters.educationId,
    regionIds: filters.regionIds,
    employmentTypeIds: filters.employmentTypeIds,
    salaryId: filters.salaryId,
    workModeIds: filters.workModeIds,
    companyTypeIds: filters.companyTypeIds,
    institutionTypeIds: filters.institutionTypeIds,
    contractPeriodIds: filters.contractPeriodIds,
    workTypeIds: filters.workTypeIds,
    hourlyPayRangeId: filters.hourlyPayRangeId,
    pharmacyFeatureIds: filters.pharmacyFeatureIds,
    scheduleIds: filters.scheduleIds,
    hospitalTypeIds: filters.hospitalTypeIds,
    shiftTypeIds: filters.shiftTypeIds,
  };
}

function FilterPillButton({
  label,
  summary,
  open,
  onClick,
}: {
  label: string;
  summary: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex h-[36px] max-w-full items-center gap-2 border px-3.5 text-[13px] font-medium transition-colors",
        open
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-[#d7d7d7] bg-white text-[#444444] hover:border-[#111111] hover:text-[#111111]",
      )}
      aria-expanded={open}
    >
      <span className="shrink-0">{label}</span>
      {summary ? (
        <span className={clsx("max-w-[120px] truncate text-[12px] font-normal", open ? "text-white/72" : "text-[#777777]")}>{summary}</span>
      ) : null}
      {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
    </button>
  );
}

export function MyPagePreferencesClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JobTrack>("industry");
  const [openFilterId, setOpenFilterId] = useState<string | null>("job");
  const [drafts, setDrafts] = useState<TrackPreferences>({});
  const [savedSnapshots, setSavedSnapshots] = useState<TrackPreferences>({});
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setActiveTab(getTrackFromUrl());
    const stored = getAllStoredJobPreferences();
    setDrafts(stored);
    setSavedSnapshots(stored);
  }, []);

  const config = trackFilterConfigs[activeTab];
  const draft = drafts[activeTab] ?? emptyUserPreference;
  const savedSnapshot = savedSnapshots[activeTab] ?? emptyUserPreference;
  const draftFilters = useMemo(() => toFullFilters(activeTab, draft), [activeTab, draft]);
  const chips = useMemo(() => buildAppliedChips(draftFilters), [draftFilters]);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(savedSnapshot);
  const openDefinition = config.filters.find((definition) => definition.id === openFilterId) ?? null;

  const handleTabChange = (track: JobTrack) => {
    setActiveTab(track);
    setOpenFilterId("job");
    window.history.replaceState(null, "", `/mypage/preferences?track=${track}`);
  };

  const updateDraft = (updater: (current: UserJobPreference) => UserJobPreference) => {
    setDrafts((current) => ({ ...current, [activeTab]: updater(current[activeTab] ?? emptyUserPreference) }));
  };

  const updateDraftFilters = (updater: (current: JobFilters) => JobFilters) => {
    updateDraft((current) => mergeFiltersIntoDraft(current, updater(toFullFilters(activeTab, current))));
  };

  const toggleJobCategory = (id: string) => updateDraftFilters((filters) => toggleJobCategoryInFilters(filters, id));
  const toggleJobSubcategory = (id: string) => updateDraftFilters((filters) => toggleJobSubcategoryInFilters(filters, id));

  const toggleMultiFilter = (key: FilterStateKey, id: string) =>
    updateDraftFilters((filters) => ({
      ...filters,
      [key]: filters[key].includes(id) ? filters[key].filter((existing) => existing !== id) : [...filters[key], id],
    }));

  const setSingleFilter = (key: SingleFilterStateKey, id: string | null) =>
    updateDraftFilters((filters) => ({
      ...filters,
      [key]: id === "any" || filters[key] === id ? null : id,
    }));

  const handleRemoveChip = (chip: AppliedFilterChip) => updateDraftFilters((filters) => removeChipFromFilters(filters, chip));

  const handleResetAll = () => updateDraft(() => emptyUserPreference);

  const handleCancel = () => router.push(`/jobs?track=${activeTab}`);

  const handleSave = () => {
    if (!hasChanges) return;
    setStoredJobPreference(activeTab, draft);
    setSavedSnapshots((current) => ({ ...current, [activeTab]: draft }));
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "관심 조건 설정" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">관심 조건 설정</h1>
      <p className="mt-2.5 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        관심 있는 채용 조건을 분야별로 미리 저장해두면, 해당 분야 공고 목록에서 조건에 맞는 공고를 더 빠르게 확인할 수 있습니다.
      </p>

      <CategoryTabs activeTrack={activeTab} onChange={handleTabChange} />

      <section className="mt-5 border border-[#dddddd] bg-[#f7f7f7] px-5 py-5 max-[640px]:px-4">
        <div className="flex flex-wrap items-center gap-2">
          {config.filters.map((definition) => {
            const open = openFilterId === definition.id;
            const summary = summaryForDefinition(definition, draftFilters);

            return (
              <FilterPillButton
                key={definition.id}
                label={definition.label}
                summary={summary}
                open={open}
                onClick={() => setOpenFilterId((current) => (current === definition.id ? null : definition.id))}
              />
            );
          })}
        </div>

        {openDefinition ? (
          <div className="mt-3 border border-[#dddddd] bg-white px-3.5 py-3.5">
            {openDefinition.kind === "job" ? (
              <JobFilterPanel
                categories={openDefinition.categories}
                selectedCategoryIds={draftFilters.jobCategoryIds}
                selectedJobIds={draftFilters.jobSubcategoryIds}
                onToggleJobCategory={toggleJobCategory}
                onToggleJobSubcategory={toggleJobSubcategory}
              />
            ) : openDefinition.kind === "options" ? (
              <OptionsPanel
                options={openDefinition.options}
                selected={selectedIds(draftFilters, openDefinition.stateKey)}
                onToggle={(id) =>
                  openDefinition.selection === "multiple"
                    ? toggleMultiFilter(openDefinition.stateKey as FilterStateKey, id)
                    : setSingleFilter(openDefinition.stateKey as SingleFilterStateKey, id)
                }
              />
            ) : (
              <GroupPanel
                sections={openDefinition.sections}
                filters={draftFilters}
                onToggleMultiFilter={toggleMultiFilter}
                onSetSingleFilter={setSingleFilter}
              />
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-[#596373]">선택한 조건 {chips.length > 0 ? `(${chips.length})` : ""}</p>
          {chips.length > 0 ? (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex h-8 items-center gap-1.5 text-[12px] font-medium text-[#8a94a3] transition-colors hover:text-[#111111]"
            >
              <RotateCcw size={13} />
              전체 초기화
            </button>
          ) : null}
        </div>
        <SelectedFilterChips chips={chips} onRemove={handleRemoveChip} />
      </section>

      <section className="mt-8 border border-[#dfe4ea] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold tracking-[-0.02em] text-[#17202c]">이메일 알림</h2>
            <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">
              이 분야의 관심 조건과 일치하는 신규 공고를 이메일로 받아보세요.
            </p>
          </div>
          <ToggleSwitch
            label="이메일 알림"
            checked={draft.emailAlertEnabled}
            onChange={(checked) =>
              updateDraft((current) => ({
                ...current,
                emailAlertEnabled: checked,
                emailFrequency: checked ? current.emailFrequency ?? "daily" : null,
              }))
            }
          />
        </div>
        {draft.emailAlertEnabled ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf1f5] pt-5">
            {emailFrequencyOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => updateDraft((current) => ({ ...current, emailFrequency: option.id }))}
                className={clsx(
                  "min-h-[32px] border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                  draft.emailFrequency === option.id
                    ? "border-brand bg-[var(--color-brand-soft)] text-brand"
                    : "border-[#dfe4ea] bg-white text-[#424b57] hover:border-brand hover:text-brand",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mt-8 flex items-center justify-end gap-2 border-t border-[#e5e9ef] pt-6 max-[520px]:flex-wrap">
        <Button type="button" variant="secondary" size="md" onClick={handleCancel}>
          취소
        </Button>
        <Button
          type="button"
          variant="gradient"
          size="md"
          disabled={!hasChanges}
          onClick={handleSave}
          className={clsx(!hasChanges && "cursor-not-allowed opacity-40")}
        >
          저장
        </Button>
      </div>

      {showSavedToast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          관심 조건이 저장되었습니다.
        </div>
      ) : null}
    </MyPageShell>
  );
}
