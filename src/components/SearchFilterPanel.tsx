"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { SelectedFilterChips } from "@/components/SelectedFilterChips";
import type {
  AppliedFilterChip,
  FilterDefinition,
  FilterOption,
  FilterSectionDefinition,
  FilterStateKey,
  JobCategoryOption,
  JobFilters,
  SpecialJobFilterKey,
  JobTrack,
  SingleFilterStateKey,
  TrackFilterConfig,
} from "@/types/jobs";

interface SearchFilterPanelProps {
  track: JobTrack;
  config: TrackFilterConfig;
  filters: JobFilters;
  keywordInput: string;
  appliedChips: AppliedFilterChip[];
  onKeywordInputChange: (value: string) => void;
  onSubmitKeyword: () => void;
  onToggleJobCategory: (id: string) => void;
  onToggleJobSubcategory: (id: string) => void;
  onToggleMultiFilter: (key: FilterStateKey, id: string) => void;
  onSetSingleFilter: (key: SingleFilterStateKey, id: string | null) => void;
  onSetSpecialFilter: (key: SpecialJobFilterKey, checked: boolean) => void;
  onRemoveAppliedFilter: (chip: AppliedFilterChip) => void;
  onResetAll: () => void;
}

const specialFilterOptions: Array<{ key: SpecialJobFilterKey; label: string }> = [
  { key: "leaderOnly", label: "리더급 공고" },
  { key: "headhuntingOnly", label: "헤드헌팅 공고" },
  { key: "quickApplyOnly", label: "간편지원 공고" },
];

function isFilterStateKey(key: FilterStateKey | SingleFilterStateKey): key is FilterStateKey {
  return key.endsWith("Ids");
}

function selectedIds(filters: JobFilters, key: FilterStateKey | SingleFilterStateKey) {
  const value = filters[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

function optionLabel(options: FilterOption[], id: string) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function summaryFromOptions(options: FilterOption[], ids: string[]) {
  if (ids.length === 0) return "";
  if (ids.length === 1) return optionLabel(options, ids[0]);
  return `${optionLabel(options, ids[0])} 외 ${ids.length - 1}개`;
}

function summaryForDefinition(definition: FilterDefinition, filters: JobFilters) {
  if (definition.kind === "job") {
    const categoryOptions = definition.categories.map((category) => ({
      ...category,
      label: `${category.label} 전체`,
    }));
    const options = [...categoryOptions, ...definition.categories.flatMap((category) => category.subcategories)];
    return summaryFromOptions(options, [...filters.jobCategoryIds, ...filters.jobSubcategoryIds]);
  }

  if (definition.kind === "options") {
    return summaryFromOptions(definition.options, selectedIds(filters, definition.stateKey));
  }

  const summaries = definition.sections
    .map((section) => summaryFromOptions(section.options, selectedIds(filters, section.stateKey)))
    .filter(Boolean);
  if (summaries.length === 0) return "";
  if (summaries.length === 1) return summaries[0];
  return `${summaries[0]} 외 ${summaries.length - 1}개`;
}

function OptionChip({
  option,
  active,
  disabled,
  onClick,
}: {
  option: FilterOption;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "min-h-[32px] border px-3 py-1.5 text-left text-[12px] font-medium leading-[1.35] transition-colors",
        active
          ? "border-brand bg-[var(--color-brand-soft)] text-brand"
          : "border-[#dfe4ea] bg-white text-[#424b57] hover:border-brand hover:text-brand",
        disabled && "cursor-not-allowed opacity-45 hover:border-[#dfe4ea] hover:text-[#424b57]",
      )}
      title={option.description}
    >
      <span>{option.label}</span>
      {option.description ? <span className="ml-1 text-[11px] font-normal text-[#8b94a1]">{option.description}</span> : null}
    </button>
  );
}

function JobFilterPanel({
  categories,
  selectedCategoryIds,
  selectedJobIds,
  onToggleJobCategory,
  onToggleJobSubcategory,
}: {
  categories: JobCategoryOption[];
  selectedCategoryIds: string[];
  selectedJobIds: string[];
  onToggleJobCategory: (id: string) => void;
  onToggleJobSubcategory: (id: string) => void;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");

  useEffect(() => {
    setActiveCategoryId(categories[0]?.id ?? "");
  }, [categories]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  );
  const activeCategorySubcategoryCount =
    activeCategory?.subcategories.filter((subcategory) => selectedJobIds.includes(subcategory.id)).length ?? 0;
  const activeCategoryAllSelected = Boolean(activeCategory && selectedCategoryIds.includes(activeCategory.id));

  return (
    <div className="grid gap-3.5 md:grid-cols-[200px_1fr]">
      <div className="border border-[#e3e7ec] bg-white">
        {categories.map((category) => {
          const count = category.subcategories.filter((subcategory) => selectedJobIds.includes(subcategory.id)).length;
          const selected = selectedCategoryIds.includes(category.id) || count > 0;
          const active = activeCategory?.id === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setActiveCategoryId(category.id);
                onToggleJobCategory(category.id);
              }}
              className={clsx(
                "flex h-[38px] w-full items-center justify-between border-b border-[#eef1f4] px-3 text-left text-[12px] font-medium last:border-b-0",
                active ? "bg-[#080808] text-white" : selected ? "bg-[#f4f4f4] text-[#171b20]" : "bg-white text-[#46505d] hover:bg-[#f6f7f8]",
              )}
            >
              <span>{category.label}</span>
              {selected ? (
                <span className={clsx("text-[12px]", active ? "text-white/80" : "text-[#6f767f]")}>
                  {selectedCategoryIds.includes(category.id) && count === 0 ? "전체" : count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="border border-[#e3e7ec] bg-[#fbfcfc] p-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold text-[#2c3440]">{activeCategory?.label}</p>
          <p className="text-[12px] font-normal text-[#848d9b]">
            {activeCategoryAllSelected ? "전체 선택" : activeCategorySubcategoryCount ? `${activeCategorySubcategoryCount}개 선택` : "2차 선택 사항"}
          </p>
        </div>
        {activeCategory ? (
          <div className="mb-3 flex flex-wrap gap-2 border-b border-[#eef1f4] pb-3">
            <OptionChip
              option={{ id: `${activeCategory.id}-all`, label: `${activeCategory.label} 전체` }}
              active={activeCategoryAllSelected}
              onClick={() => onToggleJobCategory(activeCategory.id)}
            />
            <span className="flex items-center text-[11px] font-normal text-[#8a939f]">
              1차 분류만 선택해도 검색에 반영됩니다.
            </span>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(activeCategory?.subcategories ?? []).map((subcategory) => {
            const active = selectedJobIds.includes(subcategory.id);
            return (
              <OptionChip
                key={subcategory.id}
                option={subcategory}
                active={active}
                onClick={() => onToggleJobSubcategory(subcategory.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OptionsPanel({
  options,
  selected,
  onToggle,
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <OptionChip key={option.id} option={option} active={selected.includes(option.id)} onClick={() => onToggle(option.id)} />
      ))}
    </div>
  );
}

function GroupPanel({
  sections,
  filters,
  onToggleMultiFilter,
  onSetSingleFilter,
}: {
  sections: FilterSectionDefinition[];
  filters: JobFilters;
  onToggleMultiFilter: (key: FilterStateKey, id: string) => void;
  onSetSingleFilter: (key: SingleFilterStateKey, id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const selected = selectedIds(filters, section.stateKey);
        return (
          <div key={section.id}>
            <p className="mb-2 text-[13px] font-semibold text-[#3a4350]">{section.title}</p>
            <OptionsPanel
              options={section.options}
              selected={selected}
              onToggle={(id) =>
                section.selection === "multiple" && isFilterStateKey(section.stateKey)
                  ? onToggleMultiFilter(section.stateKey, id)
                  : onSetSingleFilter(section.stateKey as SingleFilterStateKey, id)
              }
            />
          </div>
        );
      })}
    </div>
  );
}

export function SearchFilterPanel({
  track,
  config,
  filters,
  keywordInput,
  appliedChips,
  onKeywordInputChange,
  onSubmitKeyword,
  onToggleJobCategory,
  onToggleJobSubcategory,
  onToggleMultiFilter,
  onSetSingleFilter,
  onSetSpecialFilter,
  onRemoveAppliedFilter,
  onResetAll,
}: SearchFilterPanelProps) {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const openDefinition = config.filters.find((definition) => definition.id === openFilterId) ?? null;

  useEffect(() => {
    setOpenFilterId(null);
  }, [track]);

  return (
    <div>
      <section className="surface border-[#dddddd] bg-[#f7f7f7] px-3.5 py-3.5" aria-label="채용공고 검색 및 필터">
        <div className="flex items-center gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
          <div className="flex h-[44px] min-w-0 flex-1 overflow-hidden border border-[#d7d7d7] bg-white">
            <div className="grid w-10 place-items-center text-[#8b95a4]">
              <Search size={18} />
            </div>
            <input
              value={keywordInput}
              onChange={(event) => onKeywordInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSubmitKeyword();
                }
              }}
              className="min-w-0 flex-1 text-[13px] font-normal text-text placeholder:text-[#8d8d8d]"
              placeholder={siteConfig.searchPlaceholder}
              aria-label="채용공고 검색어"
            />
          </div>

          <button
            type="button"
            onClick={onSubmitKeyword}
            className="h-[44px] w-[88px] bg-[#050505] text-[13px] font-medium text-white transition-colors hover:bg-[#222222] max-[720px]:w-full"
          >
            검색
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {config.filters.map((definition) => {
            const open = openFilterId === definition.id;
            const summary = summaryForDefinition(definition, filters);

            return (
              <button
                key={definition.id}
                type="button"
                onClick={() => setOpenFilterId((current) => (current === definition.id ? null : definition.id))}
                className={clsx(
                  "inline-flex h-[36px] max-w-full items-center gap-2 border px-3.5 text-[13px] font-medium transition-colors",
                  open
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#d7d7d7] bg-white text-[#444444] hover:border-[#111111] hover:text-[#111111]",
                )}
                aria-expanded={open}
              >
                <span className="shrink-0">{definition.label}</span>
                {summary ? (
                  <span className={clsx("max-w-[86px] truncate text-[12px] font-normal", open ? "text-white/72" : "text-[#777777]")}>
                    {summary}
                  </span>
                ) : null}
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetAll}
            className="ml-auto inline-flex h-[36px] items-center justify-center gap-1.5 border border-[#d9dee5] bg-white px-3.5 text-[12px] font-medium text-[#667080] transition-colors hover:border-brand hover:text-brand max-[760px]:ml-0"
          >
            <RotateCcw size={15} />
            전체 초기화
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e3e5e8] pt-3">
          {specialFilterOptions.map((option) => (
            <label
              key={option.key}
              className="inline-flex h-[34px] cursor-pointer items-center gap-2 border border-[#d7d7d7] bg-white px-3 text-[12px] font-medium text-[#444444] transition-colors hover:border-[#111111] hover:text-[#111111]"
            >
              <input
                type="checkbox"
                checked={filters[option.key]}
                onChange={(event) => onSetSpecialFilter(option.key, event.target.checked)}
                className="h-4 w-4 accent-[#111111]"
              />
              {option.label}
            </label>
          ))}
        </div>

        {openDefinition ? (
          <div className="mt-2 border border-[#dddddd] bg-white px-3.5 py-3.5">
            {openDefinition.kind === "job" ? (
              <JobFilterPanel
                categories={openDefinition.categories}
                selectedCategoryIds={filters.jobCategoryIds}
                selectedJobIds={filters.jobSubcategoryIds}
                onToggleJobCategory={onToggleJobCategory}
                onToggleJobSubcategory={onToggleJobSubcategory}
              />
            ) : openDefinition.kind === "options" ? (
              <OptionsPanel
                options={openDefinition.options}
                selected={selectedIds(filters, openDefinition.stateKey)}
                onToggle={(id) =>
                  openDefinition.selection === "multiple" && isFilterStateKey(openDefinition.stateKey)
                    ? onToggleMultiFilter(openDefinition.stateKey, id)
                    : onSetSingleFilter(openDefinition.stateKey as SingleFilterStateKey, id)
                }
              />
            ) : (
              <GroupPanel
                sections={openDefinition.sections}
                filters={filters}
                onToggleMultiFilter={onToggleMultiFilter}
                onSetSingleFilter={onSetSingleFilter}
              />
            )}
          </div>
        ) : null}
      </section>

      <SelectedFilterChips chips={appliedChips} onRemove={onRemoveAppliedFilter} />
    </div>
  );
}
