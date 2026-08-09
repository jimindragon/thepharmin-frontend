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
    <div
      className={clsx(
        "flex gap-2 overflow-x-auto pb-1 max-[760px]:flex-wrap max-[760px]:overflow-x-visible",
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
            className={clsx(
              "inline-flex h-9 shrink-0 items-center gap-1.5 border px-4 text-[13px] font-medium transition-colors max-[760px]:h-10",
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
