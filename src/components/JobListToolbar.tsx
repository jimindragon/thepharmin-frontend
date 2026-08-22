"use client";

import clsx from "clsx";
import type { SortOption } from "@/types/jobs";

const defaultSortOptions: SortOption[] = ["추천순", "최신순", "마감임박순"];

interface SortButtonsProps {
  options?: SortOption[];
  sortOption: SortOption;
  onChange: (sortOption: SortOption) => void;
  /**
   * "box"  — 기본. 테두리로 나뉜 분절 탭. 정렬칸이 전폭을 쓰는 자리(JobListToolbar는 ≤760px에서
   *          items-stretch로 한 줄을 통째로 내준다)라 좁은 화면에서도 박스가 답답하지 않다.
   * "text" — ≤760px에서 박스를 벗고 텍스트 토글이 된다. 정렬이 제목과 **같은 줄을 나눠 쓰는**
   *          자리용이다 — 박스 3칸(222px)이 제목을 밀어 "이 채용관의 공고 4"가 두 줄로 접혔다.
   *          761px 이상은 box와 완전히 같은 렌더다.
   */
  variant?: "box" | "text";
}

/**
 * text 변형은 QNA 정렬(QnaHomeClient의 SortControl)과 같은 문법이다 — 활성 #111111 + font-medium,
 * 비활성 #8a94a3, 밑줄 없음. 기본값을 모바일로 두고 min-[761px]:로 박스를 다시 붙이는 단방향
 * 변형만 쓴다: 같은 속성에 max-/min- 변형을 둘 다 달면 Tailwind 출력 순서에 기대게 된다.
 * box 변형의 클래스 문자열은 손대지 않았다 — /jobs 목록·홈이 쓰는 렌더가 그대로여야 한다.
 */
export function SortButtons({ options = defaultSortOptions, sortOption, onChange, variant = "box" }: SortButtonsProps) {
  const isText = variant === "text";

  return (
    <div
      className={clsx(
        isText
          ? "flex h-10 shrink-0 items-center gap-4 min-[761px]:grid min-[761px]:h-9 min-[761px]:gap-0 min-[761px]:overflow-hidden min-[761px]:border min-[761px]:border-[#dce2ea] min-[761px]:bg-white"
          : "grid h-9 overflow-hidden border border-[#dce2ea] bg-white",
      )}
      /* ≤760px text 변형은 display:flex라 이 값을 무시한다 — 761px 이상에서만 효력이 있다 */
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={sortOption === option}
          className={clsx(
            "whitespace-nowrap text-[13px] font-medium",
            isText
              ? // 텍스트일 때도 40px 터치 타깃 — 높이는 부모(h-10)가 주고 버튼이 전부 채운다
                "h-full transition-colors min-[761px]:min-w-[104px] min-[761px]:border-r min-[761px]:border-[#dce2ea] min-[761px]:px-3.5 min-[761px]:last:border-r-0"
              : // ≤760px에서는 정렬칸이 전폭(items-stretch)이라 min-w가 필요 없다 —
                // 약국 트랙(정렬 4개)이 좁은 화면에서 잘리지 않도록 여기서만 풀어준다.
                // whitespace-nowrap이 함께 있어야 한다: min-w를 풀면 칸이 좁아져 "마감임박순"·"시급 높은순"이
                // 두 줄로 접히고, h-9 + overflow-hidden에 둘째 줄이 잘린다.
                "min-w-[104px] border-r border-[#dce2ea] px-3.5 last:border-r-0 max-[760px]:min-w-0",
            sortOption === option
              ? isText
                ? "text-[#111111] min-[761px]:bg-[#111111] min-[761px]:text-white"
                : "bg-[#111111] text-white"
              : isText
                ? "text-[#8a94a3] min-[761px]:text-[#3d4653] min-[761px]:hover:bg-[#f4f4f4]"
                : "text-[#3d4653] hover:bg-[#f4f4f4]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

interface JobListToolbarProps {
  /** null이면 개수 자리를 비운다 — 아직 셈이 끝나지 않았을 때(URL 파싱 전) 틀린 수를 보여주지 않기 위한 값. */
  totalCount: number | null;
  sortOption: SortOption;
  sortOptions?: SortOption[];
  onSortChange: (sortOption: SortOption) => void;
}

export function JobListToolbar({
  totalCount,
  sortOption,
  sortOptions,
  onSortChange,
}: JobListToolbarProps) {
  return (
    <div className="mb-2.5 mt-5 flex items-center justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="flex flex-wrap items-center gap-3">
        {/* 개수를 모를 때도 문구 줄은 남긴다 — 줄이 통째로 사라지면 목록이 세로로 밀린다. */}
        <p className="text-[17px] font-bold text-[#3c4655]">
          {totalCount === null ? (
            <span className="invisible">총 0개 공고</span>
          ) : (
            <>
              총 <span className="text-brand">{totalCount}개</span> 공고
            </>
          )}
        </p>
      </div>
      <SortButtons options={sortOptions} sortOption={sortOption} onChange={onSortChange} />
    </div>
  );
}
