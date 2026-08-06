"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useState } from "react";
import { FieldLabel } from "@/components/business/BusinessFormControls";
import { IN } from "@/components/job-registration/fieldClasses";


export interface RecommendedKeywordPickerProps {
  /** 추천 키워드 풀. 직무/분야 연동이 있는 트랙은 호출부가 선택 상태에 맞춰 계산해 전달한다. */
  recommendedKeywords: string[];
  /** 라벨 아래 표시할 트랙별 설명 한 줄 */
  hint: string;
  /** 직접 입력 필드의 placeholder */
  customPlaceholder: string;
  /** 현재 선택된 키워드(추천 풀에서 고른 것 + 직접 추가한 것 전체) */
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  /** 직접 추가한 키워드(추천 풀 밖의 키워드) — 항상 선택 상태 칩으로 표시되고 클릭 시 제거 */
  customKeywords: string[];
  onCustomKeywordsChange: (next: string[]) => void;
  maxCount?: number;
}

export function RecommendedKeywordPicker({
  recommendedKeywords,
  hint,
  customPlaceholder,
  selected,
  onSelectedChange,
  customKeywords,
  onCustomKeywordsChange,
  maxCount = 8,
}: RecommendedKeywordPickerProps) {
  const [customInput, setCustomInput] = useState("");

  function toggleKeyword(kw: string) {
    const next = new Set(selected);
    if (next.has(kw)) next.delete(kw);
    else if (next.size < maxCount) next.add(kw);
    onSelectedChange(next);
  }

  function addCustomKeyword() {
    const v = customInput.trim();
    if (!v || v.length > 10 || selected.has(v) || selected.size >= maxCount) return;
    const next = new Set(selected);
    next.add(v);
    onSelectedChange(next);
    onCustomKeywordsChange([...customKeywords, v]);
    setCustomInput("");
  }

  function removeCustomKeyword(kw: string) {
    const next = new Set(selected);
    next.delete(kw);
    onSelectedChange(next);
    onCustomKeywordsChange(customKeywords.filter((k) => k !== kw));
  }

  return (
    <div className="mb-6">
      <FieldLabel className="mb-2 flex flex-wrap items-baseline gap-3">
        검색 키워드
        <span className="text-[13px] font-normal text-[#7b8491]">{selected.size} / {maxCount}개 선택</span>
        <span className="text-[13px] font-normal text-[#7b8491]">{hint}</span>
      </FieldLabel>

      {recommendedKeywords.length > 0 && (
        <div role="group" aria-label="추천 키워드" className="flex flex-wrap gap-2">
          {recommendedKeywords.map((kw) => {
            const on = selected.has(kw);
            const blocked = selected.size >= maxCount && !on;
            return (
              <button key={kw} type="button" role="checkbox" aria-checked={on} aria-disabled={blocked}
                onClick={() => !blocked && toggleKeyword(kw)}
                className={clsx(
                  "inline-flex h-9 items-center gap-1.5 border px-3.5 text-[12px] font-medium transition-colors",
                  on ? "border-[#111111] bg-[#111111] text-white"
                    : blocked ? "cursor-not-allowed border-[#dfe4ea] bg-[#f5f6f7] text-[#aeb6c0]"
                      : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
                )}>
                {on && <span className="text-[10px]" aria-hidden>✓</span>}
                {kw}
              </button>
            );
          })}
        </div>
      )}

      <div className="my-4 border-t border-[#f0f2f5]" />

      {/* Custom keyword input */}
      <FieldLabel className="mb-2 flex flex-wrap items-baseline gap-3">
        기타 키워드 추가
        <span className="text-[13px] font-normal text-[#7b8491]">추천 목록에 없는 키워드를 직접 입력할 수 있습니다. (10자 이내)</span>
      </FieldLabel>
      <div className="flex items-center gap-2">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKeyword(); } }}
          maxLength={10}
          placeholder={customPlaceholder}
          className={`${IN} flex-1`}
          aria-label="키워드 직접 입력"
        />
        <button type="button" onClick={addCustomKeyword}
          disabled={selected.size >= maxCount}
          className="h-11 border border-[#111111] bg-white px-4 text-[13px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:border-[#dfe4ea] disabled:text-[#aeb6c0]">
          ＋ 추가
        </button>
      </div>

      {/* Custom keywords as chips (always "on", click removes) */}
      {customKeywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {customKeywords.map((kw) => (
            <button key={kw} type="button" onClick={() => removeCustomKeyword(kw)}
              aria-label={`${kw} 키워드 삭제`}
              className="inline-flex h-9 items-center gap-1.5 border border-[#111111] bg-[#111111] px-3.5 text-[12px] font-medium text-white">
              <span className="text-[10px]" aria-hidden>✓</span>
              {kw}
              <X size={11} className="ml-0.5 opacity-70" aria-hidden />
            </button>
          ))}
        </div>
      )}

      {/*
        선택 상한(maxCount=8)과 목록 노출 개수(5)는 서로 다른 값이다 — 5는 JobCard.tsx의
        coreKeywords.slice(0, 5)에서 온다(홈 카드는 4개, 공고 상세는 6개로 또 다르다).
        "최대 5개까지 표시됩니다" 한 문장이 둘을 뭉개 선택 상한처럼 읽혔던 것을 갈라 적는다.
      */}
      <p className="mt-2.5 text-[12px] text-[#a0a9b7]">
        선택한 키워드는 공고 검색과 추천 공고 노출에 활용됩니다. 최대 {maxCount}개까지 선택할 수 있고, 공고 목록 카드에는 앞 5개가 표시됩니다.
      </p>
    </div>
  );
}
