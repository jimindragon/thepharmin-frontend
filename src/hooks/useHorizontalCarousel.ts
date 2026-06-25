"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EDGE_EPSILON = 4;

/**
 * 가로 스크롤 카드 목록(업계를 이끄는 기업/테마별 공고 등)이 공유하는 캐러셀 로직.
 * 컨테이너에 `containerRef`를 붙이고 각 카드에 `data-carousel-item`을 붙이면, 카드 한 개
 * 폭(+간격)만큼 부드럽게 스크롤하는 `scrollPrev`/`scrollNext`와 시작·끝 위치에서 자동으로
 * 꺼지는 `canScrollPrev`/`canScrollNext`를 얻을 수 있다. 마우스·트랙패드 스크롤과 터치
 * 스와이프, 창 크기 변경에도 상태가 갱신된다.
 */
export function useHorizontalCarousel<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    setCanScrollPrev(node.scrollLeft > EDGE_EPSILON);
    setCanScrollNext(node.scrollLeft < node.scrollWidth - node.clientWidth - EDGE_EPSILON);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    updateScrollState();

    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const node = containerRef.current;
    if (!node) return;

    const card = node.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = parseFloat(getComputedStyle(node).columnGap || "0") || 0;
    const amount = card ? card.getBoundingClientRect().width + gap : node.clientWidth;

    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  return {
    containerRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev: () => scrollByCard(-1),
    scrollNext: () => scrollByCard(1),
  };
}
