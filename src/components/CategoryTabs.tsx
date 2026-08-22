"use client";

import clsx from "clsx";
import { PageTabBar } from "@/components/ui/PageTabBar";
import { jobTracks } from "@/config/jobTracks";
import type { JobTrack } from "@/types/jobs";

interface CategoryTabsProps {
  /**
   * null이면 어느 탭도 활성으로 그리지 않는다 — 트랙을 URL에서 읽기 전(첫 렌더)에 기본값인
   * 산업이 잠깐 켜졌다 바뀌는 것을 막기 위한 자리다. 탭 자체는 그대로 그려 레이아웃이 흔들리지 않는다.
   */
  activeTrack: JobTrack | null;
  onChange: (track: JobTrack) => void;
  /**
   * page: /jobs처럼 이 탭이 h1 바로 아래 "그 페이지의 첫 컨트롤"인 자리.
   * ≤760px에서만 탭바 페이지 공용 스킨(PageTabBar)으로 바뀌고 761px 이상은 default와 같다.
   * 홈 섹션 안이나 마이페이지 관심조건처럼 h1 아래가 아닌 자리는 default를 그대로 쓴다.
   */
  variant?: "default" | "page";
}

/**
 * 트랙(산업·연구·병원·약국) 전환 탭.
 *
 * page 변형은 한 DOM에 브레이크포인트 오버라이드를 얹지 않고 모바일용 PageTabBar를 따로 렌더한다.
 * 두 모습이 컨테이너 구조부터 다르고(flex+하단 구분선 ↔ 테두리 박스+균등 grid), 버튼도 개별 테두리·
 * 회색 바탕·고정 최소폭을 전부 되돌려야 해서, 한 DOM으로 합치면 PageTabBar 사양을 유틸리티로 손수
 * 베껴 쓰게 된다 — 공용 추출로 없애려던 그 중복이 그대로 살아난다. 4개짜리 탭이라 DOM 이중화 비용이
 * 더 싸고, 모바일 모습이 PageTabBar 그 자체라 스킨이 어긋날 여지가 없다.
 */
export function CategoryTabs({ activeTrack, onChange, variant = "default" }: CategoryTabsProps) {
  return (
    <>
      <div
        className={clsx(
          "mt-5 flex gap-2 border-b border-[#eceff1] pb-3.5",
          variant === "page" && "max-[760px]:hidden",
        )}
      >
        {jobTracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => onChange(track.id)}
            className={clsx(
              // ≤360px: 4탭 × min-w 74 + gap 3칸 = 320이 가용 폭(320px 화면에서 272)을 넘긴다.
              // 최소폭을 놓아주고 좌우 여백만 줄이면 2글자 라벨 기준 4탭이 240으로 한 줄에 들어간다.
              "h-[40px] min-w-[84px] border px-5 text-[14px] font-medium transition-colors max-[520px]:min-w-[74px] max-[520px]:px-4 max-[360px]:min-w-0 max-[360px]:px-3",
              activeTrack === track.id
                ? "border-[#111111] bg-[#111111] text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
            )}
            title={track.description}
          >
            {track.label}
          </button>
        ))}
      </div>

      {variant === "page" ? (
        <PageTabBar
          className="mt-7 min-[761px]:hidden"
          ariaLabel="공고 분야"
          items={jobTracks.map((track) => ({ id: track.id, label: track.label }))}
          activeId={activeTrack}
          onSelect={onChange}
        />
      ) : null}
    </>
  );
}
