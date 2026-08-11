"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { LinkButton } from "@/components/ui/Button";
import { getHeroSlideCtaLabel, homeHeroSlides, type HomeHeroSlide, type HomeTrackFilter } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HERO_AUTOPLAY_ALL_TRACK_MS = 4500;
const HERO_AUTOPLAY_OTHER_TRACK_MS = 6500;

/** 스와이프로 볼 가로 이동량(px)의 하한. 이보다 짧으면 탭이 살짝 밀린 것으로 본다. */
const HERO_SWIPE_MIN_DISTANCE_PX = 44;

/**
 * 히어로 CTA를 흰 버튼으로 바꿔 보는 비교용 플래그. false가 기본이고, 그때는 현재 배포 화면과
 * 완전히 같다(variant='gradient-dark' 그대로). 사진 위에서 어떤 쪽이 나은지 눈으로 대볼 때만 켠다.
 *
 * 켤 때 className만으로는 덮이지 않는다 — gradient-dark는 backgroundImage·textShadow·transition을
 * 인라인 style로 주입하고(Button.tsx getButtonStyle), 인라인은 항상 클래스를 이긴다.
 * 다만 LinkButton이 `{...computed.style, ...style}` 순으로 병합해 호출부 style이 뒤에 오므로,
 * 덮어야 하는 값만 아래 style로 무력화하고 배경/hover는 클래스로 준다.
 * hover가 클래스로 도는 이상 filter도 같이 꺼야 한다 — 남겨 두면 hover:brightness-110이
 * 흰 계열 hover 배경을 다시 흰색으로 되돌려 눌러도 변화가 안 보인다.
 *
 * Button.tsx의 gradient-dark 원본은 건드리지 않는다 — 기업 랜딩·기업 헤더·QNA가 함께 쓴다.
 */
const HERO_CTA_SOLID_WHITE: boolean = false;

const HERO_CTA_SOLID_WHITE_CLASS = "bg-white hover:bg-[#f3f3f3]";

const HERO_CTA_SOLID_WHITE_STYLE = {
  backgroundImage: "none",
  color: "#111111",
  textShadow: "none",
  filter: "none",
  transition: "background-color 160ms ease",
} as const;

/**
 * 제목을 titleBreakAfter 지점에서 두 덩어리로 나눠 각각 줄바꿈을 막는다.
 * 덩어리 사이의 공백만 유일한 줄바꿈 기회가 되므로, 좁으면 그 지점에서 꺾이고 넓으면 한 줄로 이어진다.
 * (<wbr>는 기회를 "추가"할 뿐이라 탐욕적 줄채움이 여전히 뒤쪽 공백을 골라 이 목적에 쓸 수 없다.)
 *
 * 덩어리를 붙들면 폭이 아주 좁을 때 잘리므로 nowrap은 360px 이상에서만 건다 — 그 아래는 기존 자동 줄바꿈 그대로다.
 * 문구는 title 하나에서만 오고, titleBreakAfter가 title의 접두어가 아니면 자동 줄바꿈으로 되돌아간다.
 *
 * ≤640px에서는 이 지점을 "기회"가 아니라 강제 줄바꿈으로 승격한다. 덩어리만 잡아 두면 줄 수가 문구
 * 길이에 딸려가, 짧은 제목 하나만 1줄로 남고 나머지 셋은 2줄이 되어 슬라이드를 넘길 때 제목·부제·CTA가
 * 통째로 25px씩 오르내린다(실측: 자연 복원 폭이 연구 378px / 산업 400px / 병원 421px / 약국 427px로 제각각).
 * 네 장 모두 같은 자리에서 꺾이게 하면 넘겨도 글 블록이 제자리에 선다.
 * 표준 경계(640)를 쓰는 이유는 여기서 깨져서가 아니라 반대다 — 폰 폭(≤430) 전체를 여유 있게 덮으면서
 * 641px 이상은 네 장이 이미 다 같이 한 줄이라, 문구가 바뀌어도 규칙이 흔들리지 않는 가장 가까운 표준값이다.
 * display:none인 <br>은 줄바꿈을 만들지 않으므로 641px 이상은 종전 자동 동작 그대로다.
 */
function renderSlideTitle(slide: HomeHeroSlide) {
  const lead = slide.titleBreakAfter;
  if (!lead || !slide.title.startsWith(`${lead} `)) return slide.title;

  return (
    <>
      <span className="min-[360px]:whitespace-nowrap">{lead}</span>{" "}
      <br className="hidden max-[640px]:inline" />
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

  /*
   * 터치 스와이프. 이 캐러셀은 슬라이드가 전부 겹쳐 놓인 채 opacity로만 교차되는 구조라
   * (가로 스크롤 컨테이너가 아니다) 브라우저가 주는 스와이프가 없다 — ≤760px에서 ‹›를 걷어내면
   * 점 인디케이터 탭만 남아 조작성이 후퇴한다. 그래서 여기서 직접 받는다.
   *
   * 세로 이동이 더 크면 무시한다: 배너가 화면 폭을 꽉 채우게 되어 페이지를 세로로 훑는 손가락이
   * 거의 항상 배너 위를 지나가는데, 그때 곁들여 생긴 가로 흔들림으로 슬라이드가 넘어가면 안 된다.
   * preventDefault는 하지 않는다(세로 스크롤을 뺏지 않는다) — 판정은 손을 뗀 뒤에만 한다.
   */
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || visibleSlides.length <= 1) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < HERO_SWIPE_MIN_DISTANCE_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    moveSlide(deltaX < 0 ? 1 : -1);
  };

  return (
    /* 헤더~히어로 28px → 0(≤760px): 모바일은 첫 화면에 들어오는 세로가 짧아 헤더 바로 아래 빈 띠가
       그대로 손실이다. 20px으로 한 번 줄였지만 실기기에서는 여전히 "떠 있는" 판으로 읽혔다 —
       히어로가 화면 폭을 꽉 채우는(풀블리드) 이상 위 여백만 남기면 좌우와 규칙이 어긋난다.
       0으로 두면 헤더 하단선이 그대로 배너의 윗변이 되어 한 덩어리로 붙는다. 761px 이상은 pt-7 그대로다. */
    <section className="pt-7 max-[760px]:pt-0">
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
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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

              {/* ≤760px 아래 여백 24(pb-6) → 32(pb-8): CTA가 배너 바닥에 깔려 보였다. 아래를 8px 벌린 만큼
                  부제→CTA 간격을 8px 줄여(mt-9 → max-[760px]:mt-7) 상쇄하므로, 제목·부제가 서 있는 자리와
                  세로 예산은 그대로고 CTA만 8px 위로 올라온다. 761px 이상(pb-14/pb-10)은 손대지 않는다. */}
              <div className="relative z-10 flex h-full flex-col justify-end px-14 pb-14 max-[1024px]:px-10 max-[1024px]:pb-10 max-[760px]:px-6 max-[760px]:pb-8">
                {/* 배너 높이가 고정(290/260/244)이라 제목·부제 크기가 곧 레이아웃 여유다.
                    ≤760px 기준 세로 예산은 제목+부제 126px(244 − CTA 44(h-11) − mt-7 28 − pb-8 32 − mt-[14px] 14).
                    CTA 위(28)와 아래(32)를 재배분해도 합(60)이 종전(36+24)과 같아 이 예산은 변하지 않는다 —
                    둘 중 하나만 손대면 그만큼 예산이 깎여 제목 첫 줄이 잘리므로 반드시 짝으로 움직일 것.
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
                <div className="mt-9 flex flex-wrap items-center gap-5 max-[760px]:mt-7">
                  {/*
                    사진 위 단독 CTA — 어두운 변형.
                    ≤380px 축소는 페이저와 한 줄을 나눠 쓰던 시절의 처방이다(CTA 158 + 페이저 116 = 274라
                    본문 폭이 274에 못 미치는 ≤369px에서 겹쳤다). ≤760px에서 페이저가 배너 밖으로 나가며
                    다툴 상대는 사라졌지만, 좁은 폭 회귀를 막아 둔 안전장치라 그대로 둔다.

                    ≤760px 안쪽 여백 축소: 높이 48(h-12) → 44(h-11), 좌우 24(px-6) → 20(px-5).
                    라벨이 짧아(“연구 공고 15건 보기 ›”) 알약이 글자에 비해 두툼했다. 44px은 iOS/안드로이드가
                    권하는 터치 타깃 하한과 같은 값이라 여기가 바닥이다 — 더 줄이지 않는다.
                    글자(14px)는 15px 바닥 규칙 아래라 손대지 않는다. 761px 이상은 h-12/px-6 그대로다.

                    화살표는 LinkButton 기본 gap-2(8px)로 붙는다. 라벨이 "…보기"로 끝나 목적지가 있다는 신호가
                    글자밖에 없었다. 16px은 14px 라벨 옆에서 글자보다 커 보이지 않는 크기다.
                  */}
                  <LinkButton
                    href={slide.href}
                    variant="gradient-dark"
                    size="lg"
                    className={`max-[760px]:h-11 max-[760px]:px-5 max-[380px]:px-3 max-[380px]:text-[13px]${
                      HERO_CTA_SOLID_WHITE ? ` ${HERO_CTA_SOLID_WHITE_CLASS}` : ""
                    }`}
                    style={HERO_CTA_SOLID_WHITE ? HERO_CTA_SOLID_WHITE_STYLE : undefined}
                  >
                    {getHeroSlideCtaLabel(slide)}
                    <ChevronRight size={16} aria-hidden />
                  </LinkButton>
                </div>
              </div>
            </div>
          );
        })}

        {/* 페이저는 761px 이상 전용이 됐다 — ≤760px는 배너 아래 점 인디케이터가 대신한다.
            사진 위에 얹힌 검은 알약이 CTA와 같은 줄을 나눠 쓰느라 좁은 폭에서 서로 밀어내던 문제도 함께 사라진다. */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-end px-14 pb-6 max-[1024px]:px-10 max-[760px]:hidden">
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

      {/* ≤760px 점 인디케이터 — 사진 위가 아니라 배너 밖(바로 아래)에 둔다. 배너가 화면 폭을 꽉 채우게 되면서
          안쪽 아래 구석은 CTA가 이미 쓰고 있고, 사진 위에 얹은 크롬은 슬라이드마다 배경 밝기가 달라 대비가 흔들린다.
          현재 위치를 알리는 역할만 하므로 흰 바탕 위에서 회색/검정 두 톤이면 충분하다.

          6px 점을 그대로 누르게 하면 탭 타깃이 6px밖에 안 되므로, 각 버튼 안에 투명 span을 겹쳐 히트 영역만
          넓힌다(자식이 부모 밖으로 나가도 클릭은 버튼이 받는다). 레이아웃은 6px + gap 8px 그대로다.

          세로는 40px, 가로는 14px이다. 가로도 40px로 하면 이웃 점의 히트 영역과 겹치고, 겹친 구간은 DOM에서
          뒤에 있는(=오른쪽) 점이 전부 가져간다 — 실측했더니 3번째 점을 눌러도 4번째가 켜졌다. 점 간격(pitch)이
          6+8=14px이라 겹치지 않는 최대 가로가 14px이고, 이 값이면 점 행 전체(4×14=56px)가 빈틈도 겹침도 없이
          덮인다. 그래서 늘릴 수 있는 축은 세로뿐이다. 위아래로 17px씩 넘치지만 위는 배너 여백, 아래는 다음
          섹션까지 56px이라 남의 탭을 가로채지 않는다. 점만으로 조작하게 두지 않으려고 스와이프를 함께 넣었다. */}
      {visibleSlides.length > 1 ? (
        <div className="mt-4 hidden items-center justify-center gap-2 max-[760px]:flex" role="group" aria-label="배너 선택">
          {visibleSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`relative h-1.5 w-1.5 rounded-full transition-colors ${index === currentIndex ? "bg-[#111111]" : "bg-[#d1d6dd]"}`}
              onClick={() => setSlideIndex(index)}
              aria-label={`${index + 1}번째 배너 보기`}
              aria-current={index === currentIndex}
            >
              <span className="absolute left-1/2 top-1/2 h-10 w-[14px] -translate-x-1/2 -translate-y-1/2" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
