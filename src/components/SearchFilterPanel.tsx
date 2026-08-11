"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { SelectedFilterChips } from "@/components/SelectedFilterChips";
import { FilterSheet, countForDefinition } from "@/components/jobs/FilterSheet";
import { isFilterStateKey, selectedIds } from "@/hooks/useJobFilters";
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
  onToggleResearchFieldCategory: (id: string) => void;
  onToggleResearchFieldSubcategory: (id: string) => void;
  onToggleMultiFilter: (key: FilterStateKey, id: string) => void;
  onSetSingleFilter: (key: SingleFilterStateKey, id: string | null) => void;
  onSetSpecialFilter: (key: SpecialJobFilterKey, checked: boolean) => void;
  onRemoveAppliedFilter: (chip: AppliedFilterChip) => void;
  onResetAll: () => void;
  /** 모바일 시트가 draft를 통째로 확정할 때 쓰는 입구. 개별 setter와 달리 한 번에 반영한다. */
  onApplyFilters: (filters: JobFilters) => void;
  /** 시트 CTA의 "N개 공고 보기". 목록과 같은 필터 함수를 호출부가 넘긴다 — 여기서 규칙을 다시 쓰지 않는다. */
  countJobs: (filters: JobFilters) => number;
}

/** 모바일 트리거 행의 칩 하나. 시트를 여는 칩(hasSheet)과 값 자체를 토글하는 칩 둘 다를 그린다. */
function MobileFilterChip({
  label,
  count,
  active,
  hasSheet,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  hasSheet?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={hasSheet ? undefined : active}
      className={clsx(
        "inline-flex h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap border px-3.5 text-[13px] font-medium transition-colors",
        active ? "border-[#111111] bg-[#111111] text-white" : "border-[#d7d7d7] bg-white text-[#444444]",
      )}
    >
      {label}
      {count ? <span className="font-semibold">{count}</span> : null}
      {hasSheet ? <ChevronDown size={14} className={active ? "text-white/70" : "text-[#8b95a4]"} /> : null}
    </button>
  );
}

const specialFilterOptions: Array<{ key: SpecialJobFilterKey; label: string; tracks?: JobTrack[] }> = [
  { key: "leaderOnly", label: "리더급 공고" },
  { key: "headhuntingOnly", label: "헤드헌팅 공고" },
  { key: "quickApplyOnly", label: "간편지원 공고" },
  { key: "hourlyIncludeUnknown", label: "시급 미표기 포함", tracks: ["pharmacy"] },
  { key: "salaryIncludeUnknown", label: "급여 미표기 포함", tracks: ["hospital"] },
];

// 필터 상태의 모양을 다루는 두 헬퍼는 훅 쪽 정본을 그대로 쓴다. 여기서 다시 내보내는 것은
// 마이페이지 관심조건 화면이 이 경로로 가져다 쓰고 있기 때문이다(호출부는 손대지 않는다).
export { isFilterStateKey, selectedIds };

function optionLabel(options: FilterOption[], id: string) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function summaryFromOptions(options: FilterOption[], ids: string[]) {
  if (ids.length === 0) return "";
  if (ids.length === 1) return optionLabel(options, ids[0]);
  return `${optionLabel(options, ids[0])} 외 ${ids.length - 1}개`;
}

export function summaryForDefinition(definition: FilterDefinition, filters: JobFilters) {
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

  if (definition.kind === "researchField") {
    const categoryOptions = definition.categories.map((category) => ({
      ...category,
      label: `${category.label} 전체`,
    }));
    const options = [...categoryOptions, ...definition.categories.flatMap((category) => category.subcategories)];
    return summaryFromOptions(options, [...filters.researchFieldCategoryIds, ...filters.researchFieldIds]);
  }

  const summaries = definition.sections
    .map((section) => summaryFromOptions(section.options, selectedIds(filters, section.stateKey)))
    .filter(Boolean);
  if (summaries.length === 0) return "";
  if (summaries.length === 1) return summaries[0];
  return `${summaries[0]} 외 ${summaries.length - 1}개`;
}

export function OptionChip({
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
        "min-h-[36px] border px-3 py-1.5 text-left text-[13px] font-medium leading-[1.35] transition-colors",
        active
          ? "border-brand bg-[var(--color-brand-soft)] text-brand"
          : "border-[#dfe4ea] bg-white text-[#424b57] hover:border-brand hover:text-brand",
        disabled && "cursor-not-allowed opacity-45 hover:border-[#dfe4ea] hover:text-[#424b57]",
      )}
      title={option.description}
    >
      <span>{option.label}</span>
      {option.description ? <span className="ml-1 text-[12px] font-normal text-[#8b94a1]">{option.description}</span> : null}
    </button>
  );
}

export function JobFilterPanel({
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
                "flex h-[38px] w-full items-center justify-between border-b border-[#eef1f4] px-3 text-left text-[13px] font-medium last:border-b-0",
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
          <p className="min-w-0 text-[14px] font-semibold text-[#2c3440]">{activeCategory?.label}</p>
          <p className="shrink-0 whitespace-nowrap text-[13px] font-normal text-[#848d9b]">
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
            <span className="flex items-center break-keep text-[12px] font-normal text-[#8a939f]">
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

export function OptionsPanel({
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

export function GroupPanel({
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
            <p className="mb-2 text-[14px] font-semibold text-[#3a4350]">{section.title}</p>
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
  onToggleResearchFieldCategory,
  onToggleResearchFieldSubcategory,
  onToggleMultiFilter,
  onSetSingleFilter,
  onSetSpecialFilter,
  onRemoveAppliedFilter,
  onResetAll,
  onApplyFilters,
  countJobs,
}: SearchFilterPanelProps) {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  // 데스크톱 인라인 드롭다운과 모바일 시트는 서로 다른 상태를 쓴다 — 한쪽이 열린 채 폭이 바뀌어도 엉키지 않는다.
  const [sheetFilterId, setSheetFilterId] = useState<string | null>(null);
  const openDefinition = config.filters.find((definition) => definition.id === openFilterId) ?? null;
  const sheetDefinition = config.filters.find((definition) => definition.id === sheetFilterId) ?? null;
  const visibleSpecialFilters = specialFilterOptions.filter((option) => !option.tracks || option.tracks.includes(track));

  useEffect(() => {
    setOpenFilterId(null);
    setSheetFilterId(null);
  }, [track]);

  return (
    <div>
      {/* .surface를 쓰지 않는다 — globals.css의 .surface가 @tailwind utilities 뒤 raw CSS라
          background 단축 속성이 같은 명시도의 bg-* 유틸리티를 순서로 덮어(패널이 흰색으로 렌더) 버린다.
          테두리는 .surface와 동일한 border-border(#e6e9ee)를 그대로 쓴다. */}
      <section className="border border-border bg-[#f7f7f7] px-3.5 py-3.5" aria-label="채용공고 검색 및 필터">
        <div className="flex items-center gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
          {/* ≤720px에서 부모가 flex-col로 바뀌면 flex-1(=flex-basis:0)이 세로축에 걸려 h-[44px]를 덮어쓴다
              (박스가 글자 높이인 27px로 찌그러져 아래 검색 버튼 44px과 어긋났다). 그 구간에서만 flex 사이징을
              끄면 h-[44px]가 다시 살아난다 — 폭은 부모의 items-stretch가 채운다.
              같은 자리에 height를 다시 선언해도 flex-basis가 이기므로 무효고, flex-1을 w-full로 바꾸면
              ≥721px 가로 배치에서 검색 버튼(shrink-0 없음)이 88 → 78px로 함께 줄어든다. */}
          <div className="flex h-[44px] min-w-0 flex-1 overflow-hidden border border-[#d7d7d7] bg-white max-[720px]:flex-none">
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
              className="min-w-0 flex-1 text-[15px] font-normal text-text placeholder:text-[#8d8d8d]"
              placeholder={siteConfig.searchPlaceholder}
              aria-label="채용공고 검색어"
              enterKeyHint="search"
            />
          </div>

          {/* ≤760px에서는 전폭 검색 버튼을 접는다 — 키보드의 검색 키(enterKeyHint)와 엔터가 같은 일을 하고,
              그 한 줄이 곧 필터 블록 높이라 접는 값이 크다. 데스크톱은 그대로 둔다. */}
          <button
            type="button"
            onClick={onSubmitKeyword}
            className="h-[44px] w-[88px] bg-[#050505] text-[13px] font-medium text-white transition-colors hover:bg-[#222222] max-[760px]:hidden max-[720px]:w-full"
          >
            검색
          </button>
        </div>

        {/* ── 모바일(≤760px) 트리거 행 ────────────────────────────────────────────
            데스크톱의 pill 줄(6종)·체크박스 줄(3~5종)·펼쳐지는 패널 3층을 가로 스크롤 한 줄로 접는다.
            드롭다운 6종은 시트를 열고, 특수 조건 체크박스는 칩 자체가 토글이다(시트 없음). */}
        <div className="mt-3 -mx-3.5 flex gap-2 overflow-x-auto px-3.5 [-ms-overflow-style:none] [scrollbar-width:none] min-[761px]:hidden [&::-webkit-scrollbar]:hidden">
          {config.filters.map((definition) => {
            const count = countForDefinition(definition, filters);

            return (
              <MobileFilterChip
                key={definition.id}
                label={definition.label}
                count={count}
                active={count > 0}
                hasSheet
                onClick={() => setSheetFilterId(definition.id)}
              />
            );
          })}

          {visibleSpecialFilters.map((option) => (
            <MobileFilterChip
              key={option.key}
              label={option.label}
              active={filters[option.key]}
              onClick={() => onSetSpecialFilter(option.key, !filters[option.key])}
            />
          ))}
        </div>

        {/* 데스크톱(≥761px) pill 줄 — 인라인 드롭다운을 여는 현행 트리거. 모바일에서는 위 칩 행이 대신한다. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 max-[760px]:hidden">
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
                  <span className={clsx("max-w-[120px] truncate text-[13px] font-normal", open ? "text-white/70" : "text-[#777777]")}>
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
            className="ml-auto inline-flex h-[36px] items-center justify-center gap-1.5 border border-[#d9dee5] bg-white px-3.5 text-[13px] font-medium text-[#667080] transition-colors hover:border-brand hover:text-brand max-[760px]:ml-0"
          >
            <RotateCcw size={15} />
            전체 초기화
          </button>
        </div>

        {/* 데스크톱(≥761px) 특수 조건 체크박스 줄. 모바일에서는 같은 값이 칩 토글로 올라가 있다. */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e3e5e8] pt-3 max-[760px]:hidden">
          {visibleSpecialFilters.map((option) => (
            <label
              key={option.key}
              className="inline-flex h-[36px] cursor-pointer items-center gap-2 border border-[#d7d7d7] bg-white px-3 text-[13px] font-medium text-[#444444] transition-colors hover:border-[#111111] hover:text-[#111111]"
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
          <div className="dropdown-panel mt-2 border border-[#dddddd] bg-white px-3.5 py-3.5 max-[760px]:hidden">
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
            ) : openDefinition.kind === "researchField" ? (
              <JobFilterPanel
                categories={openDefinition.categories}
                selectedCategoryIds={filters.researchFieldCategoryIds}
                selectedJobIds={filters.researchFieldIds}
                onToggleJobCategory={onToggleResearchFieldCategory}
                onToggleJobSubcategory={onToggleResearchFieldSubcategory}
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

      {/* 조건이 하나도 없을 때의 "적용 조건 / 선택된 조건 없음" 안내는 모바일에서 접는다 —
          칩 행이 이미 "무엇이 몇 개 걸렸는지"를 보여주고 있어 한 줄을 더 쓸 값이 없다.
          하나라도 걸리면 다시 나온다 — 칩을 하나씩 떼는 자리는 여기뿐이다.

          모바일 "전체 초기화"도 여기 붙는다. 트리거 칩 행은 가로로 955px까지 늘어나 그 끝에 두면
          칩 아홉 개를 지나야 닿는데, 이 줄은 초기화가 의미 있을 때(=조건이 걸렸을 때)만 나타나고
          자리도 고정이다. 데스크톱은 pill 줄 오른쪽 끝의 기존 버튼을 그대로 쓴다. */}
      <div
        className={clsx(
          "max-[760px]:flex max-[760px]:items-start max-[760px]:gap-2",
          appliedChips.length === 0 && "max-[760px]:hidden",
        )}
      >
        <div className="max-[760px]:min-w-0 max-[760px]:flex-1">
          <SelectedFilterChips chips={appliedChips} onRemove={onRemoveAppliedFilter} />
        </div>
        <button
          type="button"
          onClick={onResetAll}
          className="mt-3 hidden h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap border border-[#d9dee5] bg-white px-3 text-[13px] font-medium text-[#667080] transition-colors hover:border-brand hover:text-brand max-[760px]:inline-flex"
        >
          <RotateCcw size={14} />
          전체 초기화
        </button>
      </div>

      {sheetDefinition ? (
        <FilterSheet
          key={sheetDefinition.id}
          definition={sheetDefinition}
          filters={filters}
          countJobs={countJobs}
          onApply={(next) => {
            onApplyFilters(next);
            setSheetFilterId(null);
          }}
          onClose={() => setSheetFilterId(null)}
        />
      ) : null}
    </div>
  );
}
