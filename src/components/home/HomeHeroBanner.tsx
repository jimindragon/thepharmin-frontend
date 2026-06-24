"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { homeHeroSlides, type HomeTrackFilter } from "@/data/home";
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
        className="relative h-[380px] overflow-hidden bg-[#0a0c10] text-white max-[1024px]:h-[350px] max-[760px]:h-[320px]"
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

              <div className="relative z-10 flex h-full flex-col px-14 pb-6 pt-[88px] max-[1024px]:px-10 max-[1024px]:pt-12 max-[760px]:px-6 max-[760px]:pb-6 max-[760px]:pt-11">
                <h1 className="max-w-[720px] break-keep text-[36px] font-bold leading-[1.25] tracking-[-0.02em] text-white max-[760px]:text-[24px]">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-[620px] text-[15px] font-normal leading-7 text-white/76">
                  {slide.tags.map((tag) => `#${tag}`).join(" ")}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <LinkButton href={slide.href} variant="gradient" size="lg">
                    {slide.positionCount}
                  </LinkButton>
                  <span className="text-[13px] font-normal text-white/64">{slide.deadline}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-14 pb-6 max-[1024px]:px-10 max-[760px]:px-6">
          <div className="flex items-center gap-2">
            {visibleSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={clsx("h-1.5 transition-all duration-300", index === currentIndex ? "w-7 bg-white" : "w-1.5 bg-white/38 hover:bg-white/60")}
                onClick={() => setSlideIndex(index)}
                aria-label={`${index + 1}번째 배너 보기`}
                aria-current={index === currentIndex}
              />
            ))}
            <span className="ml-4 text-[13px] font-normal text-white/64">
              {currentIndex + 1} / {visibleSlides.length}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              onClick={() => moveSlide(-1)}
              aria-label="이전 배너"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              onClick={() => moveSlide(1)}
              aria-label="다음 배너"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
