"use client";

import clsx from "clsx";
import { Check, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ModalShell } from "@/components/ui/ModalShell";
import {
  emptyJobFilters,
  isFilterStateKey,
  selectedIds,
  setSingleFilterInFilters,
  toggleJobCategoryInFilters,
  toggleJobSubcategoryInFilters,
  toggleMultiFilterInFilters,
  toggleResearchFieldCategoryInFilters,
  toggleResearchFieldInFilters,
} from "@/hooks/useJobFilters";
import type {
  FilterDefinition,
  FilterOption,
  FilterStateKey,
  JobCategoryOption,
  JobFilters,
  SingleFilterStateKey,
} from "@/types/jobs";

/**
 * 모바일(≤760px) 공고 필터 바텀시트.
 *
 * 데스크톱의 인라인 드롭다운 하나가 여기서는 시트 하나가 된다 — 필터 종류마다 따로 열리고,
 * 시트 안의 선택은 **임시(draft)**다. "N개 공고 보기"를 눌러야 목록에 반영되고, X·딤·ESC로
 * 닫으면 통째로 버린다. 즉시 반영되는 데스크톱과 여기서 갈린다.
 *
 * N은 draft로 매번 다시 센다. 세는 함수는 목록이 쓰는 것과 같은 `filterJobsByFilters`를
 * 호출부에서 `countJobs`로 주입받는다 — 여기서 필터 규칙을 다시 쓰지 않기 위해서다
 * (홈은 트랙 무시 옵션이 다를 수 있어 판정 자체를 호출부에 맡기는 편이 안전하다).
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다(ModalShell 계열의 규칙).
 */

/** 시트 하단 "초기화" — 이 필터가 건드리는 상태만 비운다. 다른 필터의 선택은 그대로 둔다. */
export function clearDefinitionInFilters(filters: JobFilters, definition: FilterDefinition): JobFilters {
  if (definition.kind === "job") {
    return { ...filters, jobCategoryIds: [], jobSubcategoryIds: [] };
  }

  if (definition.kind === "researchField") {
    return { ...filters, researchFieldCategoryIds: [], researchFieldIds: [] };
  }

  // 빈 값([] 또는 null)은 emptyJobFilters에서 그대로 가져온다 — 키마다 어느 쪽인지 다시 적지 않는다.
  if (definition.kind === "options") {
    return { ...filters, [definition.stateKey]: emptyJobFilters[definition.stateKey] };
  }

  return definition.sections.reduce<JobFilters>(
    (current, section) => ({ ...current, [section.stateKey]: emptyJobFilters[section.stateKey] }),
    filters,
  );
}

/** 트리거 칩에 붙는 선택 개수. 칩과 시트가 같은 셈을 쓴다. */
export function countForDefinition(definition: FilterDefinition, filters: JobFilters) {
  if (definition.kind === "job") {
    return filters.jobCategoryIds.length + filters.jobSubcategoryIds.length;
  }

  if (definition.kind === "researchField") {
    return filters.researchFieldCategoryIds.length + filters.researchFieldIds.length;
  }

  if (definition.kind === "options") {
    return selectedIds(filters, definition.stateKey).length;
  }

  return definition.sections.reduce((total, section) => total + selectedIds(filters, section.stateKey).length, 0);
}

/** 시트 본문의 옵션 한 줄. 칩이 아니라 목록 행이다 — 좁은 폭에서 줄바꿈으로 흔들리지 않는다. */
function OptionRow({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "flex min-h-[48px] w-full items-center justify-between gap-3 border-b border-[#f1f3f5] px-1 py-2 text-left transition-colors last:border-b-0",
        active ? "text-[#111111]" : "text-[#3d4551]",
      )}
    >
      <span className="min-w-0">
        <span className={clsx("text-[15px] leading-[1.4]", active ? "font-semibold" : "font-normal")}>{label}</span>
        {description ? <span className="ml-1.5 text-[13px] font-normal text-[#8b94a1]">{description}</span> : null}
      </span>
      {active ? <Check size={18} strokeWidth={2.4} className="shrink-0" /> : null}
    </button>
  );
}

function SheetOptionList({
  options,
  selected,
  onToggle,
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((option) => (
        <OptionRow
          key={option.id}
          label={option.label}
          description={option.description}
          active={selected.includes(option.id)}
          onClick={() => onToggle(option.id)}
        />
      ))}
    </div>
  );
}

/**
 * 직무·연구 분야용 2단. 데스크톱 JobFilterPanel의 좌우 2열을 세로로 눕힌 것이다 —
 * 대분류는 가로 스크롤 탭, 소분류는 그 아래 목록. 탭 줄은 스크롤해도 머리에 남는다.
 */
function SheetCategoryPanel({
  categories,
  selectedCategoryIds,
  selectedSubcategoryIds,
  onToggleCategory,
  onToggleSubcategory,
  scrollRef,
}: {
  categories: JobCategoryOption[];
  selectedCategoryIds: string[];
  selectedSubcategoryIds: string[];
  onToggleCategory: (id: string) => void;
  onToggleSubcategory: (id: string) => void;
  /** 이 패널을 담은 본문 스크롤 영역. 탭을 바꾸면 맨 위로 되돌린다. */
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  // 탭 전환은 목록을 통째로 갈아끼우지만 스크롤 위치는 남는다 — 새 목록의 중간부터 보이지 않도록 되감는다.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeCategoryId, scrollRef]);

  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 border-b border-[#eef1f4] bg-white px-4 pb-2 pt-1">
        <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const count =
              category.subcategories.filter((subcategory) => selectedSubcategoryIds.includes(subcategory.id)).length +
              (selectedCategoryIds.includes(category.id) ? 1 : 0);
            const active = category.id === activeCategory?.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={clsx(
                  "h-[34px] shrink-0 whitespace-nowrap border px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "border-[#111111] bg-[#111111] text-white"
                    : count
                      ? "border-[#111111] bg-white text-[#111111]"
                      : "border-[#dfe4ea] bg-white text-[#5a6472]",
                )}
              >
                {category.label}
                {count ? ` ${count}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory ? (
        <div className="flex flex-col">
          {/* 1차 분류만 골라도 검색에 반영된다 — 데스크톱 패널의 "OO 전체" 칩과 같은 자리다. */}
          <OptionRow
            label={`${activeCategory.label} 전체`}
            active={selectedCategoryIds.includes(activeCategory.id)}
            onClick={() => onToggleCategory(activeCategory.id)}
          />
          {activeCategory.subcategories.map((subcategory) => (
            <OptionRow
              key={subcategory.id}
              label={subcategory.label}
              description={subcategory.description}
              active={selectedSubcategoryIds.includes(subcategory.id)}
              onClick={() => onToggleSubcategory(subcategory.id)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function FilterSheet({
  definition,
  filters,
  countJobs,
  onApply,
  onClose,
}: {
  definition: FilterDefinition;
  /** 시트를 열 때의 확정 필터. draft의 출발점이다. */
  filters: JobFilters;
  /** draft 기준 결과 수. 목록과 같은 필터 함수를 호출부에서 넘긴다. */
  countJobs: (filters: JobFilters) => number;
  onApply: (filters: JobFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<JobFilters>(filters);
  const resultCount = countJobs(draft);
  const bodyRef = useRef<HTMLDivElement>(null);

  /**
   * 2단 시트만 높이를 못 박는다. 카테고리마다 소분류 수가 달라(산업 직무: 3~7개) 목록 길이대로 두면
   * 탭을 옮길 때마다 하단에 붙은 시트의 윗변이 오르내린다. 560px는 최다 케이스(8행 384px + 헤더·탭·푸터
   * 약 173px)를 스크롤 없이 담는 높이이고, 화면이 더 낮으면 기존 상한인 86dvh가 이긴다.
   * 항목이 한 벌뿐인 options·group 시트는 출렁일 일이 없어 지금의 auto 높이 그대로 둔다.
   */
  const twoTier = definition.kind === "job" || definition.kind === "researchField";

  const toggleOption = (stateKey: FilterStateKey | SingleFilterStateKey, selection: "single" | "multiple", id: string) => {
    setDraft((current) =>
      selection === "multiple" && isFilterStateKey(stateKey)
        ? toggleMultiFilterInFilters(current, stateKey, id)
        : setSingleFilterInFilters(current, stateKey as SingleFilterStateKey, id),
    );
  };

  return (
    <ModalShell
      title={definition.label}
      onClose={onClose}
      maxWidth="max-w-[520px]"
      sheetBreakpoint={760}
      panelClassName={twoTier ? "max-[760px]:h-[min(560px,86dvh)]" : undefined}
    >
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        {definition.kind === "job" ? (
          <SheetCategoryPanel
            categories={definition.categories}
            selectedCategoryIds={draft.jobCategoryIds}
            selectedSubcategoryIds={draft.jobSubcategoryIds}
            onToggleCategory={(id) => setDraft((current) => toggleJobCategoryInFilters(current, id))}
            onToggleSubcategory={(id) => setDraft((current) => toggleJobSubcategoryInFilters(current, id))}
            scrollRef={bodyRef}
          />
        ) : definition.kind === "researchField" ? (
          <SheetCategoryPanel
            categories={definition.categories}
            selectedCategoryIds={draft.researchFieldCategoryIds}
            selectedSubcategoryIds={draft.researchFieldIds}
            onToggleCategory={(id) => setDraft((current) => toggleResearchFieldCategoryInFilters(current, id))}
            onToggleSubcategory={(id) => setDraft((current) => toggleResearchFieldInFilters(current, id))}
            scrollRef={bodyRef}
          />
        ) : definition.kind === "options" ? (
          <SheetOptionList
            options={definition.options}
            selected={selectedIds(draft, definition.stateKey)}
            onToggle={(id) => toggleOption(definition.stateKey, definition.selection, id)}
          />
        ) : (
          <div className="flex flex-col">
            {definition.sections.map((section) => (
              <div key={section.id} className="border-b border-[#e6e9ee] pb-2 last:border-b-0">
                <p className="pt-4 text-[13px] font-semibold text-[#8a94a3]">{section.title}</p>
                <SheetOptionList
                  options={section.options}
                  selected={selectedIds(draft, section.stateKey)}
                  onToggle={(id) => toggleOption(section.stateKey, section.selection, id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ModalShell 바텀시트에 safe-area 보정이 없다 — 홈 인디케이터에 CTA가 걸리지 않도록 여기서 준다
          (AddToCalendarSheet와 같은 처리). */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => setDraft((current) => clearDefinitionInFilters(current, definition))}
          className="inline-flex h-12 shrink-0 items-center gap-1.5 border border-[#d9dee5] bg-white px-4 text-[14px] font-medium text-[#667080] transition-colors hover:border-[#111111] hover:text-[#111111]"
        >
          <RotateCcw size={15} />
          초기화
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="h-12 flex-1 bg-[#050505] text-[15px] font-medium text-white transition-colors hover:bg-[#222222]"
        >
          {resultCount}개 공고 보기
        </button>
      </div>
    </ModalShell>
  );
}
