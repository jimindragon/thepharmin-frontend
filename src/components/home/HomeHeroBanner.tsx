"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { getHeroSlideCtaLabel, homeHeroSlides, type HomeHeroSlide, type HomeTrackFilter } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HERO_AUTOPLAY_ALL_TRACK_MS = 4500;
const HERO_AUTOPLAY_OTHER_TRACK_MS = 6500;

/**
 * 제목을 titleBreakAfter 지점에서 두 덩어리로 나눠 각각 줄바꿈을 막는다.
 * 덩어리 사이의 공백만 유일한 줄바꿈 기회가 되므로, 좁으면 그 지점에서 꺾이고 넓으면 한 줄로 이어진다.
 * (<wbr>는 기회를 "추가"할 뿐이라 탐욕적 줄채움이 여전히 뒤쪽 공백을 골라 이 목적에 쓸 수 없다.)
 *
 * 덩어리를 붙들면 폭이 아주 좁을 때 잘리므로 nowrap은 360px 이상에서만 건다 — 그 아래는 기존 자동 줄바꿈 그대로다.
 * 문구는 title 하나에서만 오고, titleBreakAfter가 title의 접두어가 아니면 자동 줄바꿈으로 되돌아간다.
 */
function renderSlideTitle(slide: HomeHeroSlide) {
  const lead = slide.titleBreakAfter;
  if (!lead || !slide.title.startsWith(`${lead} `)) return slide.title;

  return (
    <>
      <span className="min-[360px]:whitespace-nowrap">{lead}</span>{" "}
      <span className="min-[360px]:whitespace-nowrap">{slide.title.slice(lead.length + 1)}</span>
    </>
  );
}

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
    /* 헤더~히어로 28px → 20px(≤760px): 모바일은 첫 화면에 들어오는 세로가 짧아 헤더 바로 아래 빈 띠가
       그대로 손실이다. 히어로가 화면 폭을 꽉 채우게 되면서 위 여백만 남아 뜨는 것도 어색해 한 단계 줄인다.
       761px 이상은 pt-7 그대로다. */
    <section className="pt-7 max-[760px]:pt-5">
      {/* ≤760px 높이 230→244: 텍스트 블록이 justify-end라 pt로는 제목이 안 내려온다. 제목 위 숨 쉴 공간(18.3→32.3px)을 만드는 레버는 배너 높이뿐이다.
          ≤760px 풀블리드 — 셸(.app-shell)이 좌우로 물러난 만큼(--shell-gutter/2) 음수 마진으로 되민다.
          FLUSH_SECTION_CLASS를 그대로 쓰지 않는 이유는 CompanyHero와 같다: 배경 이미지·그라디언트가 절대 배치라
          좌우 패딩은 이 껍데기가 아니라 아래 콘텐츠 층(relative z-10)이 가진다. 그쪽 px-6(=24px)이 곧 화면 여백이 되어
          아래 섹션 제목이 서 있는 선과 같아진다. 높이(244)는 건드리지 않는다 — 제목 잘림 예산은 아래 h1 주석 참고.
          폭이 늘어난 만큼(342→390 @390px) 제목이 쓸 수 있는 가로가 커져 줄 수는 오히려 줄거나 같다. */}
      <div
        className="relative h-[290px] overflow-hidden bg-[#0a0c10] text-white max-[1024px]:h-[260px] max-[760px]:h-[244px] max-[760px]:-mx-[calc(var(--shell-gutter)/2)]"
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
              {/* ≤760px는 별도 곡선을 쓴다. 데스크톱은 글이 좌측 720px 안에 머물러 우측이 훤히 비어도 되지만,
                  풀블리드가 되면 제목이 화면 폭 끝(392px 중 342px = 88%)까지 뻗어 종전 곡선의 밝은 구간과 겹친다.
                  CompanyHero 풀블리드 때와 같은 처방 — 끝값을 0 → 0.38로 올려 글이 얹히는 폭 전체에 어두운 바탕을 깐다. */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,13,0.95)_0%,rgba(6,8,13,0.88)_32%,rgba(6,8,13,0.6)_56%,rgba(6,8,13,0.2)_78%,rgba(6,8,13,0)_94%)] max-[760px]:bg-[linear-gradient(90deg,rgba(6,8,13,0.95)_0%,rgba(6,8,13,0.9)_40%,rgba(6,8,13,0.72)_70%,rgba(6,8,13,0.52)_88%,rgba(6,8,13,0.38)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.32)_100%)]" />

              <div className="relative z-10 flex h-full flex-col justify-end px-14 pb-14 max-[1024px]:px-10 max-[1024px]:pb-10 max-[760px]:px-6 max-[760px]:pb-6">
                {/* 배너 높이가 고정(290/260/244)이라 제목·부제 크기가 곧 레이아웃 여유다.
                    ≤760px 기준 세로 예산은 제목+부제 122px(244 − CTA 48 − mt-9 36 − pb 24 − mt-[14px] 14).
                    부제가 15px보다 크면 긴 부제(약국 슬라이드)가 2줄로 늘어나 이 예산을 넘고,
                    내용이 justify-end라 넘친 만큼 제목 첫 줄이 위로 잘린다. 키우기 전 반드시 실측할 것.

                    360px 미만에서 26px을 한 단계 더 줄이는 이유: 이 구간은 아래 renderSlideTitle의
                    nowrap 덩어리가 걸리지 않아 제목이 자유롭게 감긴다. 26px이면 320px에서 병원·약국 제목이
                    3줄(97.5px)이 돼 예산을 초과했다(병원 −0.3, 약국 −25). 24px이면 네 슬라이드 모두 2줄
                    (60px)로 떨어져 최악(약국)에도 12.5px이 남는다. 실측 파손 구간은 ≤329px이지만,
                    경계를 nowrap이 켜지는 360px에 맞춰 "자유 줄바꿈 구간 = 24px"로 규칙을 하나로 둔다 —
                    문구가 바뀌어도 이 구간이 다시 3줄로 넘어가지 않는다. 360px 이상은 손대지 않는다. */}
                <h1 className="max-w-[720px] break-keep text-[34px] font-bold leading-[1.25] tracking-[-0.02em] text-white max-[760px]:text-[26px] max-[359.98px]:text-[24px]">
                  {renderSlideTitle(slide)}
                </h1>
                <p className="mt-[14px] max-w-[560px] break-keep text-[17px] font-normal text-[#c9ced3] max-[760px]:text-[15px]">
                  {slide.subtitle}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  {/*
                    사진 위 단독 CTA — 어두운 변형.
                    이 줄은 우측 끝 페이저와 폭을 나눠 쓴다. 원래 치수로는 CTA 158 + 페이저 116 = 274라
                    본문 폭이 274에 못 미치는 ≤369px에서 겹치고, 370~380px에서도 간격이 0~10px로 붙는다.
                    배너 높이가 고정이고 제목이 이미 3줄로 상단에 붙어 있어(320px 기준 여유 0) 세로로 피할
                    수 없으므로 ≤380px에서 가로로 줄인다. 높이(h-12)는 그대로 둬 터치 타깃을 지킨다.
                  */}
                  <LinkButton
                    href={slide.href}
                    variant="gradient-dark"
                    size="lg"
                    className="max-[380px]:px-3 max-[380px]:text-[13px]"
                  >
                    {getHeroSlideCtaLabel(slide)}
                  </LinkButton>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-end px-14 pb-6 max-[1024px]:px-10 max-[760px]:px-6">
          {/* CTA와 같은 줄을 나눠 쓰므로 ≤380px에서는 페이저 쪽을 더 세게 줄인다 — CTA가 주행동이고 이쪽은 크롬이다.
              화살표 아이콘 크기(18)는 유지해 탭 타깃을 지키고, 안쪽 여백만 좁힌다. */}
          <div className="flex items-center gap-[14px] rounded-none bg-black/35 px-[14px] py-2 max-[380px]:gap-1.5 max-[380px]:px-1.5">
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
