"use client";

import clsx from "clsx";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { SECTION_ANCHOR_OFFSET } from "@/components/shared/sectionAnchorStyles";

export interface AnchorSection {
  /** 페이지가 소유한 섹션 DOM id. 이 id를 가진 요소가 없으면 해당 탭은 렌더되지 않는다. */
  id: string;
  /** 탭 문구. 섹션 제목을 그대로 쓰면 길어지는 자리(예: "자격 요건 및 우대사항")는 줄여 쓴다. */
  label: string;
  /**
   * 라벨 뒤에 붙는 건수. 0도 숫자로 찍는다(공란과 "없음"은 다른 뜻이다).
   * 세는 대상이 없는 섹션(소개·정보처럼 항목이 아니라 서술인 자리)은 넘기지 않는다 —
   * 공고 상세(jobDetailAnchors)는 전부 이 경우라 카운트를 쓰지 않는다.
   */
  count?: number;
  /**
   * 지정하면 이 항목은 같은 화면의 섹션이 아니라 **다른 라우트**로 이동한다(스크롤이 아니라 화면 교체).
   * 그 화면에 없는 목적지까지 한 행에서 잡아야 할 때만 쓴다 — 기업 상세 개요가 면접 후기·기업 리뷰를
   * 이 형태로 든다(≤760px에서 본문 미리보기를 걷어낸 대신 상단 바가 진입을 맡는다).
   *
   * 라우트 항목은 스크롤 스파이의 대상이 아니다: DOM 섹션을 갖지 않으므로 관찰하지 않고,
   * 활성 후보도 되지 않는다(밑선이 그어지는 일이 없다). id는 렌더 key·refs 용도로만 쓴다.
   */
  href?: string;
}

/**
 * 3개 미만이면 앵커 행을 렌더하지 않는다 — 두 칸짜리 목차는 훑을 것이 없어
 * 세로 공간(44px)만 먹는다. 옵셔널 섹션이 대부분 빠진 공고가 여기 해당한다.
 *
 * 라우트 항목(href)도 이 수에 포함해 센다. 그쪽은 "훑을 것"이 아니라 "여기서만 갈 수 있는 곳"이라
 * 앵커가 적다고 함께 사라지면 안 된다 — 개요 본문이 짧은 기관(섹션 2개)에서 행이 통째로 빠지면
 * ≤760px 개요에는 라우트 탭 행도 없어(CompanyDetailTabs) 상세 안을 오갈 수단이 0이 된다.
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
  /** 앵커 항목은 button, 라우트 항목은 a라 두 태그를 함께 담는다(쓰임은 scrollIntoView 하나뿐이다) */
  const tabRefs = useRef(new Map<string, HTMLElement>());

  /** 호출부가 인라인 배열을 넘겨도 매 렌더 다시 돌지 않도록 id 목록을 키로 삼는다 */
  const sectionKey = sections.map((section) => section.id).join("|");
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    /** 라우트 항목은 이 화면에 섹션을 갖지 않는 것이 정상이라 DOM 검사를 건너뛴다 */
    setResolved(sectionsRef.current.filter((section) => section.href || document.getElementById(section.id)));
  }, [sectionKey]);

  useEffect(() => {
    if (resolved.length < MIN_SECTIONS) return;

    const elements = resolved
      .filter((section) => !section.href)
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
        const first = resolved.find((section) => !section.href && visible.has(section.id));
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
  /** 폴백은 **첫 앵커 항목**이다 — resolved[0]을 그대로 쓰면 앵커가 하나도 없는 화면에서
      라우트 항목에 밑선이 그어져 "지금 여기"를 잘못 말한다. 앵커가 없으면 활성도 없다. */
  const displayActiveId = activeId ?? resolved.find((section) => !section.href)?.id ?? null;
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
        {resolved.map((section, index) => {
          const active = !section.href && section.id === displayActiveId;
          /** 항목 내용은 두 태그가 공유한다 — 라우트 항목이라고 다른 타이포·건수 문법을 쓰지 않는다 */
          const body = (
            <>
              {section.label}
              {/* 건수는 활성 여부와 무관하게 회색을 유지한다 — 색이 라벨을 따라가면 숫자가 두 번째 라벨처럼
                  강해져 "지금 어디"를 알리는 인디케이터와 경쟁한다. 크기는 라벨과 같은 13px. */}
              {typeof section.count === "number" ? (
                <span className="ml-1 font-normal text-[#8a94a3]">{section.count}</span>
              ) : null}
              {/* 인디케이터— 칩·탭바의 박스 대신 밑선 2px. "현재 위치"만 알리고 층은 올리지 않는다. */}
              {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#111111]" aria-hidden /> : null}
            </>
          );
          const itemClassName = clsx(
            "relative shrink-0 whitespace-nowrap px-3 text-[13px] font-medium transition-colors",
            active ? "text-[#111111]" : "text-[#8a94a3]",
          );
          const setRef = (node: HTMLElement | null) => {
            if (node) tabRefs.current.set(section.id, node);
            else tabRefs.current.delete(section.id);
          };

          /* 칸막이 — 앵커(누르면 스크롤)와 라우트(누르면 화면 교체)는 같은 행에 있어도 다른 일을 한다.
             누르기 전에 그 차이를 알릴 수 있는 것이 이 한 줄뿐이라 경계에 세로선을 긋는다(FilterSheet의
             탭 줄↔셰브론 칸막이와 같은 문법: bg-border, 줄 높이를 다 채우지 않는 짧은 선).
             배열 순서를 가정하지 않고 "앵커 뒤에 처음 오는 라우트 항목" 자리를 찾아 그린다 —
             라우트 항목이 없는 화면(공고 상세 4트랙)에서는 경계 자체가 없어 선도 렌더되지 않는다. */
          const startsRouteGroup = Boolean(section.href) && index > 0 && !resolved[index - 1].href;

          return (
            <Fragment key={section.id}>
              {startsRouteGroup ? <span aria-hidden="true" className="my-3 w-px shrink-0 self-stretch bg-border" /> : null}
              {section.href ? (
                /* a는 button과 달리 내용을 세로 중앙에 놓지 않는다(button은 UA 기본값이 그렇다) —
                   items-stretch 행에서 같은 높이를 받으므로 flex+items-center로 그 기본값을 흉내낸다.
                   버튼 쪽 클래스는 손대지 않는다: 이 행을 이미 쓰고 있는 공고 상세 4트랙의 렌더가 바뀌면 안 된다. */
                <Link href={section.href} ref={setRef} className={clsx(itemClassName, "flex items-center")}>
                  {body}
                </Link>
              ) : (
                <button
                  type="button"
                  ref={setRef}
                  onClick={() => handleClick(section.id)}
                  aria-current={active ? "true" : undefined}
                  className={itemClassName}
                >
                  {body}
                </button>
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
