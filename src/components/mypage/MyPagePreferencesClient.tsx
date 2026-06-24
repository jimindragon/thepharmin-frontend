"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import {
  JobFilterPanel,
  OptionsPanel,
} from "@/components/SearchFilterPanel";
import { SelectedFilterChips } from "@/components/SelectedFilterChips";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  educationOptions,
  employmentTypeOptions,
  experienceOptions,
  hospitalJobCategoryOptions,
  industryJobCategoryOptions,
  optionLabelMaps,
  pharmacyJobCategoryOptions,
  regionOptions,
  researchJobCategoryOptions,
  workModeOptions,
} from "@/config/jobFilters/index";
import { jobTracks } from "@/config/jobTracks";
import { getStoredJobPreference, setStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import type { AppliedFilterChip, EmailFrequency, FilterOption, JobTrack, UserJobPreference } from "@/types/jobs";

const emptyPreference: UserJobPreference = {
  jobSubcategoryIds: [],
  experienceId: null,
  educationId: null,
  regionIds: [],
  employmentTypeIds: [],
  workModeIds: [],
  emailAlertEnabled: false,
  emailFrequency: null,
};

const jobCategoryOptionsByTrack: Record<JobTrack, typeof industryJobCategoryOptions> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
};

const emailFrequencyOptions: { id: EmailFrequency; label: string }[] = [
  { id: "daily", label: "매일" },
  { id: "twice-weekly", label: "주 2회" },
  { id: "weekly", label: "주 1회" },
];

type PreferenceFilterDef =
  | { id: "job"; label: string; kind: "job" }
  | { id: string; label: string; kind: "single"; key: "experienceId" | "educationId"; options: FilterOption[] }
  | { id: string; label: string; kind: "multiple"; key: "regionIds" | "employmentTypeIds" | "workModeIds"; options: FilterOption[] };

const filterDefs: PreferenceFilterDef[] = [
  { id: "job", label: "관심 직무", kind: "job" },
  { id: "experience", label: "경력", kind: "single", key: "experienceId", options: experienceOptions },
  { id: "education", label: "학력", kind: "single", key: "educationId", options: educationOptions },
  { id: "region", label: "지역", kind: "multiple", key: "regionIds", options: regionOptions },
  { id: "employmentType", label: "고용 형태", kind: "multiple", key: "employmentTypeIds", options: employmentTypeOptions },
  { id: "workMode", label: "근무 방식", kind: "multiple", key: "workModeIds", options: workModeOptions },
];

function optionLabel(options: FilterOption[], id: string) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function summaryFromOptions(options: FilterOption[], ids: string[]) {
  if (ids.length === 0) return "";
  if (ids.length === 1) return optionLabel(options, ids[0]);
  return `${optionLabel(options, ids[0])} 외 ${ids.length - 1}개`;
}

function summaryForDef(def: PreferenceFilterDef, preference: UserJobPreference) {
  if (def.kind === "job") {
    return summaryFromOptions(
      [...industryJobCategoryOptions, ...researchJobCategoryOptions, ...pharmacyJobCategoryOptions, ...hospitalJobCategoryOptions].flatMap(
        (category) => category.subcategories,
      ),
      preference.jobSubcategoryIds,
    );
  }
  if (def.kind === "single") {
    const value = preference[def.key];
    return value ? optionLabel(def.options, value) : "";
  }
  return summaryFromOptions(def.options, preference[def.key]);
}

function buildChips(preference: UserJobPreference): AppliedFilterChip[] {
  const chips: AppliedFilterChip[] = [];

  preference.jobSubcategoryIds.forEach((id) => {
    chips.push({ key: `jobSubcategory:${id}`, kind: "jobSubcategory", id, label: optionLabelMaps.jobSubcategory?.get(id) ?? id });
  });
  if (preference.experienceId) {
    chips.push({
      key: `experience:${preference.experienceId}`,
      kind: "experience",
      id: preference.experienceId,
      label: optionLabelMaps.experience?.get(preference.experienceId) ?? preference.experienceId,
    });
  }
  if (preference.educationId) {
    chips.push({
      key: `education:${preference.educationId}`,
      kind: "education",
      id: preference.educationId,
      label: optionLabelMaps.education?.get(preference.educationId) ?? preference.educationId,
    });
  }
  preference.regionIds.forEach((id) => {
    chips.push({ key: `region:${id}`, kind: "region", id, label: optionLabelMaps.region?.get(id) ?? id });
  });
  preference.employmentTypeIds.forEach((id) => {
    chips.push({ key: `employmentType:${id}`, kind: "employmentType", id, label: optionLabelMaps.employmentType?.get(id) ?? id });
  });
  preference.workModeIds.forEach((id) => {
    chips.push({ key: `workMode:${id}`, kind: "workMode", id, label: optionLabelMaps.workMode?.get(id) ?? id });
  });

  return chips;
}

function removeChipFromPreference(preference: UserJobPreference, chip: AppliedFilterChip): UserJobPreference {
  switch (chip.kind) {
    case "jobSubcategory":
      return { ...preference, jobSubcategoryIds: preference.jobSubcategoryIds.filter((id) => id !== chip.id) };
    case "experience":
      return { ...preference, experienceId: null };
    case "education":
      return { ...preference, educationId: null };
    case "region":
      return { ...preference, regionIds: preference.regionIds.filter((id) => id !== chip.id) };
    case "employmentType":
      return { ...preference, employmentTypeIds: preference.employmentTypeIds.filter((id) => id !== chip.id) };
    case "workMode":
      return { ...preference, workModeIds: preference.workModeIds.filter((id) => id !== chip.id) };
    default:
      return preference;
  }
}

function preferencesEqual(a: UserJobPreference, b: UserJobPreference) {
  return JSON.stringify(a) === JSON.stringify(b);
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
  const [track, setTrack] = useState<JobTrack>("industry");
  const [openFilterId, setOpenFilterId] = useState<string | null>("job");
  const [draft, setDraft] = useState<UserJobPreference>(emptyPreference);
  const [savedSnapshot, setSavedSnapshot] = useState<UserJobPreference>(emptyPreference);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    const stored = getStoredJobPreference();
    if (stored) {
      setDraft(stored);
      setSavedSnapshot(stored);
    }
  }, []);

  const chips = useMemo(() => buildChips(draft), [draft]);
  const hasChanges = !preferencesEqual(draft, savedSnapshot);

  const toggleJobSubcategory = (id: string) => {
    setDraft((current) => ({
      ...current,
      jobSubcategoryIds: current.jobSubcategoryIds.includes(id)
        ? current.jobSubcategoryIds.filter((existing) => existing !== id)
        : [...current.jobSubcategoryIds, id],
    }));
  };

  const toggleJobCategory = (categoryId: string) => {
    const category = jobCategoryOptionsByTrack[track].find((item) => item.id === categoryId);
    if (!category) return;
    const subcategoryIds = category.subcategories.map((subcategory) => subcategory.id);
    const allSelected = subcategoryIds.every((id) => draft.jobSubcategoryIds.includes(id));

    setDraft((current) => ({
      ...current,
      jobSubcategoryIds: allSelected
        ? current.jobSubcategoryIds.filter((id) => !subcategoryIds.includes(id))
        : Array.from(new Set([...current.jobSubcategoryIds, ...subcategoryIds])),
    }));
  };

  const handleSingleToggle = (key: "experienceId" | "educationId", id: string) => {
    setDraft((current) => ({ ...current, [key]: current[key] === id ? null : id }));
  };

  const handleMultiToggle = (key: "regionIds" | "employmentTypeIds" | "workModeIds", id: string) => {
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((existing) => existing !== id) : [...current[key], id],
    }));
  };

  const handleRemoveChip = (chip: AppliedFilterChip) => {
    setDraft((current) => removeChipFromPreference(current, chip));
  };

  const handleResetAll = () => {
    setDraft(emptyPreference);
  };

  const handleCancel = () => {
    router.push("/jobs");
  };

  const handleSave = () => {
    if (!hasChanges) return;
    setStoredJobPreference(draft);
    setSavedSnapshot(draft);
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "관심 조건 설정" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">관심 조건 설정</h1>
      <p className="mt-2.5 max-w-[560px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        관심 있는 채용 조건을 미리 저장해두면, 채용공고 목록에서 조건에 맞는 공고를 더 빠르게 확인할 수 있습니다.
      </p>

      <section className="mt-7 border border-[#dddddd] bg-[#f7f7f7] px-5 py-5 max-[640px]:px-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterDefs.map((def) => {
            const open = openFilterId === def.id;
            const summary = summaryForDef(def, draft);

            return (
              <FilterPillButton
                key={def.id}
                label={def.label}
                summary={summary}
                open={open}
                onClick={() => setOpenFilterId((current) => (current === def.id ? null : def.id))}
              />
            );
          })}
        </div>

        {openFilterId ? (
          <div className="mt-3 border border-[#dddddd] bg-white px-3.5 py-3.5">
            {openFilterId === "job" ? (
              <div className="space-y-3.5">
                <div className="flex gap-2 max-[520px]:flex-wrap">
                  {jobTracks.map((trackOption) => (
                    <button
                      key={trackOption.id}
                      type="button"
                      onClick={() => setTrack(trackOption.id)}
                      className={clsx(
                        "h-[34px] min-w-[68px] border px-4 text-[13px] font-medium transition-colors",
                        track === trackOption.id
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:text-[#111111]",
                      )}
                      title={trackOption.description}
                    >
                      {trackOption.label}
                    </button>
                  ))}
                </div>
                <JobFilterPanel
                  categories={jobCategoryOptionsByTrack[track]}
                  selectedCategoryIds={[]}
                  selectedJobIds={draft.jobSubcategoryIds}
                  onToggleJobCategory={toggleJobCategory}
                  onToggleJobSubcategory={toggleJobSubcategory}
                />
              </div>
            ) : null}

            {openFilterId !== "job"
              ? filterDefs
                  .filter((def): def is Extract<PreferenceFilterDef, { kind: "single" | "multiple" }> => def.id === openFilterId)
                  .map((def) => (
                    <OptionsPanel
                      key={def.id}
                      options={def.options}
                      selected={def.kind === "single" ? (draft[def.key] ? [draft[def.key] as string] : []) : draft[def.key]}
                      onToggle={(id) => (def.kind === "single" ? handleSingleToggle(def.key, id) : handleMultiToggle(def.key, id))}
                    />
                  ))
              : null}
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
            <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">관심 조건과 일치하는 신규 공고를 이메일로 받아보세요.</p>
          </div>
          <ToggleSwitch
            label="이메일 알림"
            checked={draft.emailAlertEnabled}
            onChange={(checked) =>
              setDraft((current) => ({
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
                onClick={() => setDraft((current) => ({ ...current, emailFrequency: option.id }))}
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
