"use client";

import clsx from "clsx";

export interface TrackFilterChipItem<K extends string> {
  key: K;
  label: string;
  count: number;
}

/**
 * 마이페이지 분야 필터 칩 행 — 기존 사이트의 트랙 탭(CategoryTabs) 선택/비선택 색상을 따른다.
 * 스크랩·최근 본 공고가 공유하는 표시 전용 셸이다.
 *
 * count 계산은 절대 여기로 가져오지 않는다 — 스크랩은 스크랩 목록, 최근 본 공고는 열람 이력이
 * 소스라 두 화면의 집계 방식이 다르다. 호출부가 계산해 넘긴 값을 그대로 그리기만 한다.
 *
 * 바깥 마진도 호출부 몫이다(className) — 스크랩은 본문 흐름에 mt-5로 놓이고,
 * 최근 본 공고는 "전체 삭제" 버튼과 같은 flex 행 안에 들어가 마진이 없어야 한다.
 */
export function TrackFilterChips<K extends string>({
  items,
  activeKey,
  onSelect,
  className,
}: {
  items: TrackFilterChipItem<K>[];
  activeKey: K;
  onSelect: (key: K) => void;
  className?: string;
}) {
  return (
    // ≤760px에서는 가로 스크롤 대신 2줄로 감는다 — 칩 5개(452px)가 본문 폭(302px)을 넘어
    // "약국"이 아예 보이지 않았다. 스크롤 힌트가 없는 화면에서는 노출이 확실한 wrap이 낫다.
    // pb-1 → py-1: 아래 칩의 히트 영역이 위아래로 2px씩 넘치는데, overflow-x-auto인 데스크톱에서는
    // (overflow-y도 함께 auto가 되어) 패딩 박스 밖이 잘려 그 부분이 클릭을 받지 못한다.
    <div
      className={clsx(
        "flex gap-2 overflow-x-auto py-1 max-[760px]:flex-wrap max-[760px]:overflow-x-visible",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-pressed={active}
            /* 높이 36(h-9)으로 통일 — ≤760px만 40이던 예외를 없앤다. 캘린더 트랙 칩과 같은 규격이라
               화면을 옮겨도 칩이 같은 크기로 읽힌다. 좌우 16 → 14.
               36px은 터치 타깃 하한(40) 아래라 히트 영역만 after로 위아래 2px씩 되돌린다(보이는 상자는 36).
               -3px인 이유: absolute의 기준은 패딩 상자(=36 − 테두리 2)라 테두리 1px을 함께 되갚아야
               바깥으로 정확히 2px이 나간다(34 + 3 + 3 = 40).
               ≤760px에서 2줄로 감길 때 행 간격이 gap-2(8px)라, 넘친 2px끼리도 4px 떨어져 겹치지 않는다. */
            className={clsx(
              "relative inline-flex h-9 shrink-0 items-center gap-1.5 border px-3.5 text-[13px] font-medium transition-colors after:absolute after:inset-x-0 after:-inset-y-[3px] after:content-['']",
              active
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
            )}
          >
            {item.label}
            <span
              className={clsx(
                "inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-[1px] text-[12px] font-medium",
                active ? "bg-white/20 text-white" : "bg-white text-[#8a93a1]",
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
