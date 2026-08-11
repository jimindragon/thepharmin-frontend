"use client";

import clsx from "clsx";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
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
 *
 * 탭 줄은 접힘이 기본(한 줄 가로 스크롤)이고, 넘칠 때만 ∨ 버튼이 붙어 다단 wrap으로 펼쳐진다.
 * 산업 직무 10개는 390px에서 가로로 940px 가까이 늘어나 화면 밖 카테고리가 있다는 사실 자체가
 * 안 보인다 — QNA 카테고리 칩 줄이 같은 이유로 쓰는 방식을 여기로 가져왔다.
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
  const [tabsExpanded, setTabsExpanded] = useState(false);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  /**
   * 탭 전환은 목록을 통째로 갈아끼우지만 스크롤 위치는 남는다 — 새 목록의 중간부터 보이지 않도록 되감는다.
   * 펼친 상태였다면 같이 접는다. 탭을 골랐다는 건 카테고리 고르기가 끝났다는 뜻이고, 펼친 탭 줄은
   * 목록 자리를 100px 넘게 먹어 정작 골라야 할 소분류가 밀린다.
   */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setTabsExpanded(false);
  }, [activeCategoryId, scrollRef]);

  /**
   * ∨ 버튼을 낼지 판정한다. 카테고리 **개수**가 아니라 실제 넘침을 본다 — 같은 10개라도 폭에 따라
   * 다르고, 병원·약국 트랙처럼 2개뿐이면 한 줄에 다 들어와 버튼이 "누를 것 없는 거짓 신호"가 된다.
   *
   * QNA(항상 wrap + max-h 클램프)와 달리 여기는 접힘이 가로 스크롤이라 넘침 축이 가로다.
   * 펼친 동안은 재지 않고 직전 값을 유지한다 — wrap으로 바뀌면 가로 넘침이 사라져 scrollWidth와
   * clientWidth가 같아지고, 그대로 재면 접기 버튼이 스스로 사라진다.
   * ResizeObserver로 폭 변화(회전·리사이즈)를 따라가고, 카테고리 목록 교체는 deps가 잡는다.
   */
  useEffect(() => {
    const element = tabsRef.current;
    if (!element || tabsExpanded) return;

    const measure = () => setTabsOverflow(element.scrollWidth > element.clientWidth + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [categories, tabsExpanded]);

  /**
   * 접힌 뒤 활성 탭을 가로 스크롤 안으로 되돌린다.
   *
   * 펼치는 순간 flex-wrap으로 가로 넘침이 사라지면서 브라우저가 scrollLeft를 0으로 클램프하고 그 값을 버린다 —
   * 접기 전 위치를 복원하려 해도 원본이 남아 있지 않다. 그래서 접힌 뒤 활성 탭 기준으로 다시 계산한다.
   * 접힘 경로는 셰브론(toggleTabs)과 탭 선택에 딸린 자동 접힘 둘인데 모두 tabsExpanded로 수렴해 여기 한 곳이면 된다.
   *
   * scrollIntoView를 쓰지 않는다 — 그 호출은 스크롤 조상을 전부 훑어 본문 세로 스크롤(bodyRef)까지 건드리는데,
   * 탭 줄은 sticky인 데다 같은 타이밍에 위 두 자리가 이미 scrollTo({ top: 0 })을 부르고 있어 세로축이 다툰다.
   * offsetLeft가 아니라 rect 차를 쓰는 것은 sticky 래퍼가 positioned라 탭의 offsetParent가 tabsRef가 아니어서다.
   * 이미 보이는 탭은 건드리지 않는다(가장 가까운 가장자리로만 민다). 레이아웃 이펙트인 것은 페인트 전에 끝내야
   * scrollLeft가 0인 한 프레임이 비치지 않기 때문이다.
   */
  useLayoutEffect(() => {
    if (tabsExpanded) return;

    const element = tabsRef.current;
    const tab = activeTabRef.current;
    if (!element || !tab) return;

    // 폭도 rect에서 가져온다 — offsetWidth는 정수로 반올림돼 오른쪽 끝으로 밀 때 1px 못 미치고,
    // 그만큼 탭의 오른쪽 테두리가 잘린다(390~700px 전 구간에서 0.73px).
    const tabRect = tab.getBoundingClientRect();
    const left = tabRect.left - element.getBoundingClientRect().left + element.scrollLeft;
    const right = left + tabRect.width;

    if (left < element.scrollLeft) {
      element.scrollLeft = left;
    } else if (right > element.scrollLeft + element.clientWidth) {
      element.scrollLeft = right - element.clientWidth;
    }
  }, [tabsExpanded]);

  /**
   * 펼침과 함께 목록을 맨 위로 되감는다. 탭 줄은 sticky라 흐름에 남아 있고, 목록을 내린 상태에서
   * 펼치면 머리에 붙은 줄이 아래로 커지며 보고 있던 행을 덮는다(브라우저가 스크롤을 보정해주지 않는다).
   */
  const toggleTabs = () => {
    setTabsExpanded((current) => !current);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 border-b border-[#eef1f4] bg-white px-4 pb-3 pt-2.5">
        {/* 바깥 flex가 탭 묶음과 ∨ 버튼을 좌/우로 가른다. 버튼을 탭과 같은 묶음에 두면 마지막 탭을
            따라다녀 접힘 상태에서는 화면 밖으로 밀려난다(QNA 칩 줄과 같은 구조). */}
        <div className="flex items-start gap-2">
          <div
            ref={tabsRef}
            className={clsx(
              "flex min-w-0 flex-1 gap-1.5",
              tabsExpanded
                ? "flex-wrap"
                : "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {categories.map((category) => {
              const count =
                category.subcategories.filter((subcategory) => selectedSubcategoryIds.includes(subcategory.id)).length +
                (selectedCategoryIds.includes(category.id) ? 1 : 0);
              const active = category.id === activeCategory?.id;

              return (
                <button
                  key={category.id}
                  ref={active ? activeTabRef : null}
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

          {/* 한 줄에 다 들어가면 렌더하지 않는다 — 병원·약국 트랙은 카테고리가 2개뿐이라 늘 이 경우다.
              -my-[3px]는 40px 버튼을 34px 탭 줄 안에 눕힌다(위아래 3px씩) — 줄 높이는 그대로 34px. */}
          {tabsOverflow ? (
            <button
              type="button"
              onClick={toggleTabs}
              aria-expanded={tabsExpanded}
              aria-label={tabsExpanded ? "카테고리 접기" : "카테고리 모두 보기"}
              className="-my-[3px] grid h-10 w-10 shrink-0 place-items-center text-[#596373] transition-colors hover:text-[#111111]"
            >
              <ChevronDown size={18} className={clsx("transition-transform", tabsExpanded && "rotate-180")} aria-hidden="true" />
            </button>
          ) : null}
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
   * 탭을 옮길 때마다 하단에 붙은 시트의 윗변이 오르내린다. 581px는 최다 케이스(8행 384px + 탭 줄 57px
   * + 헤더·푸터 140px = 581px)를 그대로 담는 높이이고, 화면이 더 낮으면 기존 상한인 86dvh가 이긴다.
   * 종전 560px는 탭 줄 여백을 넓히기(pt-1/pb-2 → pt-2.5/pb-3, +10px) 전에도 8행에 11px 모자랐다.
   * 21px 올린 건 그 부족분과 여백 증가분(합 21px)을 남김없이 메운 값이다.
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
      panelClassName={twoTier ? "max-[760px]:h-[min(581px,86dvh)]" : undefined}
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
