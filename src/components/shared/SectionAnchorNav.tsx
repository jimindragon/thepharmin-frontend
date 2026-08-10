"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_ANCHOR_OFFSET } from "@/components/shared/sectionAnchorStyles";

export interface AnchorSection {
  /** 페이지가 소유한 섹션 DOM id. 이 id를 가진 요소가 없으면 해당 탭은 렌더되지 않는다. */
  id: string;
  /** 탭 문구. 섹션 제목을 그대로 쓰면 길어지는 자리(예: "자격 요건 및 우대사항")는 줄여 쓴다. */
  label: string;
}

/**
 * 3개 미만이면 앵커 행을 렌더하지 않는다 — 두 칸짜리 목차는 훑을 것이 없어
 * 세로 공간(44px)만 먹는다. 옵셔널 섹션이 대부분 빠진 공고가 여기 해당한다.
 */
const MIN_SECTIONS = 3;

/**
 * ≤760px 전용 sticky 섹션 앵커 내비게이션.
 *
 * 긴 상세 페이지(공고 상세·기업 상세)에서 "지금 어디를 보고 있고 무엇이 더 있는지"를 알리는
 * 가로 스크롤 텍스트 탭 한 행. 데스크톱은 사이드바가 그 역할을 하고 한 화면에 들어오는 정보량도
 * 달라 렌더하지 않는다(min-[761px]:hidden) — 761px 이상 레이아웃은 이 컴포넌트를 넣기 전과 같다.
 *
 * z 계층 — 본문 조각(z-10·z-20, JobCard 전면 링크 등) < **앵커 행 z-30** < 하단 고정 바·탭바(z-40)
 * < 헤더(z-50) < DEV 패널(z-60) < 모달(z-70) < 드로어(z-75) < 토스트(z-80).
 * z-30을 고른 이유: 이 행은 fixed 오버레이가 아니라 본문 흐름 안의 sticky 바이고, 그 계층은
 * 이미 z-30이다(기업센터·공고 등록·이력서 편집의 `sticky bottom-0 z-30` 저장바 7곳).
 * 헤더 아래·본문 위라는 두 조건을 동시에 만족하는 가장 낮은 층이기도 하다. 하단 고정 지원바(z-40)와는
 * 화면 반대편이라 겹치는 픽셀이 없다.
 *
 * 활성 판정은 IntersectionObserver 한 개로 끝낸다. scroll 이벤트 폴링은 쓰지 않는다 —
 * 스크롤마다 getBoundingClientRect를 N번 부르면 그때마다 레이아웃을 다시 계산하게 된다.
 */
export function SectionAnchorNav({ sections, ariaLabel = "섹션 바로가기" }: { sections: AnchorSection[]; ariaLabel?: string }) {
  /**
   * 실제로 DOM에 있는 섹션만 남긴다. 호출부는 그 화면이 가질 수 있는 섹션을 전부 나열하고,
   * 옵셔널 섹션의 렌더 여부(has* 플래그)는 여기서 DOM으로 확인한다 — 같은 조건을 페이지의
   * 렌더 분기와 앵커 배열 두 곳에 적어 두면 언젠가 한쪽만 바뀐다.
   *
   * 그래서 호출부는 **폭에 따라 숨는 섹션을 넘기면 안 된다**. display로만 감춘 섹션은 DOM에
   * 남아 있어 여기서 걸러지지 않고(공고 상세의 min-[721px]:hidden 마감일·지원 정보 블록이 그렇다),
   * 이 판정은 마운트 시 한 번만 돈다.
   *
   * 서버 렌더와 첫 클라이언트 렌더는 모두 빈 배열이라 null을 돌려준다 — 하이드레이션 불일치가 없고,
   * 실제 섹션이 붙는 것은 이펙트가 도는 그다음 프레임이다.
   */
  const [resolved, setResolved] = useState<AnchorSection[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  /** 호출부가 인라인 배열을 넘겨도 매 렌더 다시 돌지 않도록 id 목록을 키로 삼는다 */
  const sectionKey = sections.map((section) => section.id).join("|");
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    setResolved(sectionsRef.current.filter((section) => document.getElementById(section.id)));
  }, [sectionKey]);

  useEffect(() => {
    if (resolved.length < MIN_SECTIONS) return;

    const elements = resolved
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const visible = new Set<string>();

    /**
     * 관찰 구간을 "앵커 행 바로 아래 ~ 화면 40% 지점"으로 좁힌다. 위쪽 -108px는 헤더+앵커 행이
     * 덮는 만큼을 잘라내 화면에 실제로 보이는 첫 섹션이 잡히게 하고, 아래쪽 -60%는 구간을 띠로
     * 만들어 한 번에 여러 섹션이 후보가 되는 폭을 줄인다. 띠에 걸친 섹션이 여럿이면 문서 순서상
     * 가장 앞선 것이 "지금 보는 섹션"이다.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = resolved.find((section) => visible.has(section.id));
        // 섹션 사이 여백이 띠를 통째로 채우는 순간에는 후보가 비는데, 그때는 직전 활성을 유지한다
        if (first) setActiveId(first.id);
      },
      { rootMargin: `-${SECTION_ANCHOR_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [resolved]);

  /**
   * 활성 탭이 가로 스크롤 밖으로 밀려 있으면 끌어온다. block:"nearest"가 필수다 —
   * 기본값(start)이면 세로 스크롤까지 함께 움직여 페이지가 튄다(MyPageShell 선례).
   */
  const displayActiveId = activeId ?? resolved[0]?.id ?? null;
  useEffect(() => {
    if (!displayActiveId) return;
    tabRefs.current.get(displayActiveId)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [displayActiveId]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    /** 위치 보정은 섹션의 scroll-margin-top(SECTION_ANCHOR_SCROLL_MT_CLASS)이 맡는다 */
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  if (resolved.length < MIN_SECTIONS) return null;

  return (
    <nav
      /* 셸이 물러난 만큼 되밀어 흰 바가 화면 폭을 채운다 — 본문 위에 떠 있는 동안 좌우로 회색
         배경이 새면 바가 아니라 카드처럼 읽힌다. 이 컴포넌트는 ≤760px에서만 뜨므로
         --shell-gutter는 항상 48px(=좌우 24px)이고 변형을 붙일 필요가 없다.

         min-w-0는 부모가 flex/grid일 때의 기본 최소 크기(auto)를 끈다. 다만 그것만으로는
         부족한 자리가 있다 — 부모가 트랙을 명시하지 않은 grid면 열이 auto(=max-content)로 잡혀
         탭 줄 전체 길이가 페이지 폭을 늘린다(기업 상세 개요에서 390px 화면이 474px이 됐다).
         이 컴포넌트를 grid 안에 넣을 때는 부모에 grid-cols-1(=minmax(0,1fr))을 줄 것. */
      className="sticky top-16 z-30 -mx-[calc(var(--shell-gutter)/2)] min-w-0 border-b border-border bg-white min-[761px]:hidden"
      aria-label={ariaLabel}
    >
      {/* 스크롤바를 감추지 않는다 — 가려진 탭이 더 있다는 유일한 신호다.
          컨테이너 px-3 + 버튼 px-3으로 첫 탭 문구가 같은 화면의 h1·칩이 선 24px에서 시작한다. */}
      <div className="flex h-11 items-stretch overflow-x-auto px-3">
        {resolved.map((section) => {
          const active = section.id === displayActiveId;
          return (
            <button
              key={section.id}
              type="button"
              ref={(node) => {
                if (node) tabRefs.current.set(section.id, node);
                else tabRefs.current.delete(section.id);
              }}
              onClick={() => handleClick(section.id)}
              aria-current={active ? "true" : undefined}
              className={clsx(
                "relative shrink-0 whitespace-nowrap px-3 text-[13px] font-medium transition-colors",
                active ? "text-[#111111]" : "text-[#8a94a3]",
              )}
            >
              {section.label}
              {/* 인디케이터 — 칩·탭바의 박스 대신 밑선 2px. "현재 위치"만 알리고 층은 올리지 않는다. */}
              {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111111]" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
