"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { getHeroSlideCtaLabel, homeHeroSlides, type HomeTrackFilter } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HERO_AUTOPLAY_ALL_TRACK_MS = 4500;
const HERO_AUTOPLAY_OTHER_TRACK_MS = 6500;

/**
 * 홈 화면과 산업·연구·병원·약국 분야별 랜딩 페이지가 공유하는 이미지 히어로.
 * `activeTrack`이 특정 분야로 고정되면 해당 분야의 단일 슬라이드만 보여준다.
 */
export function HomeHeroBanner({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const visibleSlides = useMemo(() => {
    const filtered = activeTrack === "all" ? homeHeroSlides : homeHeroSlides.filter((slide) => slide.track === activeTrack);
    return filtered.length ? filtered : homeHeroSlides;
  }, [activeTrack]);
  const currentIndex = slideIndex % visibleSlides.length;

  useEffect(() => {
    setSlideIndex(0);
  }, [activeTrack]);

  useEffect(() => {
    const onVisibilityChange = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const autoplayPaused = isHovering || isTabHidden || prefersReducedMotion || visibleSlides.length <= 1;
  const autoplayIntervalMs = activeTrack === "all" ? HERO_AUTOPLAY_ALL_TRACK_MS : HERO_AUTOPLAY_OTHER_TRACK_MS;

  useEffect(() => {
    if (autoplayPaused) return;
    const timer = window.setTimeout(() => {
      setSlideIndex((current) => (current + 1) % visibleSlides.length);
    }, autoplayIntervalMs);
    return () => window.clearTimeout(timer);
  }, [slideIndex, autoplayPaused, autoplayIntervalMs, visibleSlides.length]);

  const moveSlide = (amount: number) => {
    setSlideIndex((current) => (current + amount + visibleSlides.length) % visibleSlides.length);
  };

  return (
    <section className="pt-7">
      <div
        className="relative h-[290px] overflow-hidden bg-[#0a0c10] text-white max-[1024px]:h-[260px] max-[760px]:h-[230px]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {visibleSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className="hero-slide absolute inset-0"
              style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: slide.imagePosition ?? "center" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,13,0.95)_0%,rgba(6,8,13,0.88)_32%,rgba(6,8,13,0.6)_56%,rgba(6,8,13,0.2)_78%,rgba(6,8,13,0)_94%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.32)_100%)]" />

              <div className="relative z-10 flex h-full flex-col justify-end px-14 pb-14 max-[1024px]:px-10 max-[1024px]:pb-10 max-[760px]:px-6 max-[760px]:pb-6">
                {/* 배너 높이가 고정(290/260/230)이라 제목·부제 크기가 곧 레이아웃 여유다.
                    ≤760px에서 제목은 2줄이 되므로, 부제가 15px보다 크면 긴 부제(약국 슬라이드)가
                    2줄로 늘어나 내용이 230px를 넘고 제목 첫 줄이 위로 잘린다. 키우기 전 반드시 실측할 것. */}
                <h1 className="max-w-[720px] break-keep text-[34px] font-bold leading-[1.25] tracking-[-0.02em] text-white max-[760px]:text-[26px]">
                  {slide.title}
                </h1>
                <p className="mt-[14px] max-w-[560px] break-keep text-[17px] font-normal text-[#c9ced3] max-[760px]:text-[15px]">
                  {slide.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  {/* 사진 위 단독 CTA — 어두운 변형 */}
                  <LinkButton href={slide.href} variant="gradient-dark" size="lg">
                    {getHeroSlideCtaLabel(slide)}
                  </LinkButton>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-end px-14 pb-6 max-[1024px]:px-10 max-[760px]:px-6">
          <div className="flex items-center gap-[14px] rounded-none bg-black/35 px-[14px] py-2">
            <button
              type="button"
              className="text-white/70 transition hover:text-white"
              onClick={() => moveSlide(-1)}
              aria-label="이전 배너"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[13px] font-normal text-white">
              {currentIndex + 1} / {visibleSlides.length}
            </span>
            <button
              type="button"
              className="text-white/70 transition hover:text-white"
              onClick={() => moveSlide(1)}
              aria-label="다음 배너"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
