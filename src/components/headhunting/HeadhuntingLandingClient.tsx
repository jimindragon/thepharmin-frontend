"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Building2, UserCheck } from "lucide-react";
import { LinkButton, Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/PageHeader";
import { mockResumes } from "@/data/resumes";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

// ─── 이력서 상태 ────────────────────────────────────────────────────────────
type ResumeState = "none" | "private" | "public";

function getResumeState(): ResumeState {
  if (mockResumes.length === 0) return "none";
  if (mockResumes.some((r) => r.proposalEnabled)) return "public";
  return "private";
}

const RESUME_STATE = getResumeState();

// ─── 정적 콘텐츠 ─────────────────────────────────────────────────────────────
const steps = [
  {
    step: "01",
    title: "이력서 공개",
    description:
      "'제안받기'를 켜면 기업과 헤드헌터가 이력서를 확인할 수 있습니다. 공개 여부는 마이페이지에서 언제든 변경할 수 있습니다.",
  },
  {
    step: "02",
    title: "제안 도착",
    description: "직무와 경력을 검토한 기업 또는 헤드헌터가 적합한 포지션을 직접 제안합니다.",
  },
  {
    step: "03",
    title: "검토 후 결정",
    description: "포지션과 조건을 확인한 뒤 제안을 수락하거나 거절할 수 있습니다.",
  },
] as const;

const offerTypes = [
  {
    badgeKind: "gray" as const,
    badgeLabel: "포지션 제안",
    icon: Building2,
    title: "기업 인사담당자가 직접 제안합니다",
    description:
      "기업이 경력과 직무 적합성을 검토한 뒤 채용 포지션을 직접 제안합니다. 현재 공개된 채용공고에 없는 포지션이 포함될 수도 있습니다.",
  },
  {
    badgeKind: "teal" as const,
    badgeLabel: "헤드헌팅 제안",
    icon: UserCheck,
    title: "전문 헤드헌터가 포지션을 연결합니다",
    description:
      "제약·바이오·헬스케어 산업과 직무를 이해하는 헤드헌터가 경력에 적합한 포지션을 발굴해 제안합니다.",
  },
] as const;

// ─── 스크롤 reveal 훅 ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = "opacity 0.55s ease, transform 0.55s ease";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            io.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

// ─── CTA 컴포넌트 ─────────────────────────────────────────────────────────────
function MainCta({ isLoggedIn, login }: { isLoggedIn: boolean; login: () => void }) {
  if (!isLoggedIn) {
    return (
      <Button variant="gradient" size="lg" onClick={login}>
        이력서 작성하기 →
      </Button>
    );
  }
  if (RESUME_STATE === "public") {
    return (
      <LinkButton href="/mypage/offers" variant="gradient" size="lg">
        받은 제안 보기
      </LinkButton>
    );
  }
  if (RESUME_STATE === "private") {
    return (
      <LinkButton href="/mypage/resume" variant="gradient" size="lg">
        이력서 관리하기
      </LinkButton>
    );
  }
  return (
    <LinkButton href="/mypage/resume/new" variant="gradient" size="lg">
      이력서 작성하기 →
    </LinkButton>
  );
}

function HeroNote({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn || RESUME_STATE === "none") {
    return (
      <p className="mt-3 text-[12.5px] font-normal leading-[1.65] text-[#8a94a3]">
        이력서를 작성하고 공개하면 기업의 포지션 제안과 헤드헌팅 제안을 받을 수 있습니다.
      </p>
    );
  }
  if (RESUME_STATE === "private") {
    return (
      <p className="mt-3 text-[12.5px] font-normal leading-[1.65] text-[#8a94a3]">
        이력서를 공개하면 포지션·헤드헌팅 제안을 받을 수 있어요.
      </p>
    );
  }
  return (
    <p className="mt-3 text-[12.5px] font-normal leading-[1.65] text-[#8a94a3]">
      공개된 이력서가 있어요. 기업과 헤드헌터가 포지션을 제안할 수 있습니다.
    </p>
  );
}

// ─── RevealSection 래퍼 ──────────────────────────────────────────────────────
function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export function HeadhuntingLandingClient() {
  const { isLoggedIn, login } = usePersonalLoginState();

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell pt-8">
        {/* ── 페이지 헤더 ── */}
        <PageHeader
          breadcrumbLabel="헤드헌팅"
          eyebrow="THE PHARMA HEADHUNTING"
          title="헤드헌팅"
          description="이력서 하나로 제약·바이오 기업과 헤드헌터로부터 포지션 제안을 받으세요."
        />

        {/* ── 히어로 카드 ── */}
        <RevealSection className="mt-8">
          <div
            className="grid grid-cols-[1fr_420px] overflow-hidden border border-[#e5e9ef] bg-white
              transition-shadow duration-300 hover:shadow-[0_14px_36px_-22px_rgba(17,19,18,0.25)]
              max-[880px]:grid-cols-1"
          >
            {/* 좌: 텍스트 */}
            <div className="flex flex-col justify-center px-10 py-12 max-[880px]:px-7 max-[880px]:py-9 max-[560px]:px-5 max-[560px]:py-7">
              <h2 className="text-[32px] font-bold leading-[1.32] tracking-[-0.03em] text-[#111312] max-[560px]:text-[26px]">
                이력서 하나로,
                <br />
                <span
                  style={{
                    backgroundImage: "var(--gradient-cta)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  나에게 맞는 포지션
                </span>
                을
                <br />
                제안받으세요
              </h2>
              <p className="mt-4 max-w-[360px] text-[14.5px] font-normal leading-[1.72] tracking-[-0.01em] text-[#4f5967] max-[880px]:max-w-none">
                제약·바이오·헬스케어 직무를 이해하는 기업과 전문 헤드헌터가 공개된 이력서를 검토하고,
                적합한 포지션을 직접 제안합니다.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <MainCta isLoggedIn={isLoggedIn} login={login} />
                {RESUME_STATE !== "public" && (
                  <Link
                    href="/mypage/offers"
                    className="inline-flex h-12 items-center border border-[#cfd8e3] bg-white px-6
                      text-[14px] font-medium text-[#303946] transition-colors
                      hover:border-[#111111] hover:bg-[#f7f8fa]"
                  >
                    받은 제안 보기
                  </Link>
                )}
              </div>
              <HeroNote isLoggedIn={isLoggedIn} />
            </div>

            {/* 우: 이미지 */}
            <div className="relative min-h-[320px] bg-[#eef0ed] max-[880px]:order-first max-[880px]:min-h-[220px]">
              <Image
                src="/images/headhunting/hero.jpg"
                alt="태블릿으로 작업 중인 모습"
                fill
                sizes="(max-width: 880px) 100vw, 420px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </RevealSection>

        {/* ── 어떻게 제안받나요? ── */}
        <RevealSection className="mt-14">
          <div className="mb-6">
            <h2 className="text-[21px] font-bold tracking-[-0.025em] text-[#111312]">어떻게 제안받나요?</h2>
            <p className="mt-1.5 text-[14px] font-normal text-[#596373]">세 단계로 시작할 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative border border-[#e5e9ef] bg-white p-6 transition-all duration-200
                  hover:-translate-y-[3px] hover:border-[#d8dce2] hover:shadow-[0_14px_34px_-22px_rgba(17,19,18,0.28)]"
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center
                    bg-[#e4f4ee] text-[13px] font-bold text-[#0f6e56]"
                >
                  {item.step}
                </span>
                <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em] text-[#111312]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13.5px] font-normal leading-[1.62] text-[#596373]">{item.description}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── 두 가지 방식 ── */}
        <RevealSection className="mt-14">
          <div className="mb-6">
            <h2 className="text-[21px] font-bold tracking-[-0.025em] text-[#111312]">
              두 가지 방식으로 제안받을 수 있습니다
            </h2>
            <p className="mt-1.5 text-[14px] font-normal text-[#596373]">
              제안을 확인하는 곳은 같지만, 제안하는 주체와 방식은 다릅니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            {offerTypes.map((offer) => {
              const Icon = offer.icon;
              return (
                <div
                  key={offer.badgeLabel}
                  className="border border-[#e5e9ef] bg-white p-7 transition-all duration-200
                    hover:-translate-y-[3px] hover:border-[#d8dce2] hover:shadow-[0_14px_34px_-22px_rgba(17,19,18,0.28)]"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12.5px] font-semibold ${
                      offer.badgeKind === "teal"
                        ? "bg-[#e4f4ee] text-[#0f6e56]"
                        : "bg-[#f0efe9] text-[#5f5e5a]"
                    }`}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                    {offer.badgeLabel}
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-[#111312]">
                    {offer.title}
                  </h3>
                  <p className="mt-2.5 text-[13.5px] font-normal leading-[1.65] text-[#596373]">
                    {offer.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-3.5 text-[12.5px] font-normal text-[#8a94a3]">
            이력서 공개 범위와 제안 수신 여부는 마이페이지에서 언제든 설정할 수 있습니다.
          </p>
        </RevealSection>

        {/* ── 클로징 CTA 카드 ── */}
        <RevealSection className="mt-14">
          <div
            className="px-10 py-16 text-center max-[560px]:px-6 max-[560px]:py-12"
            style={{
              background:
                "radial-gradient(120% 140% at 88% 14%, rgba(31,191,146,0.09) 0%, transparent 46%)," +
                "radial-gradient(120% 140% at 12% 90%, rgba(13,115,105,0.07) 0%, transparent 44%)," +
                "#0c0d0c",
            }}
          >
            <h2 className="text-[24px] font-bold leading-[1.4] tracking-[-0.025em] text-white max-[560px]:text-[20px]">
              이직을 검토하고 있다면,
              <br />
              먼저 제안받아 보세요
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[14.5px] font-normal leading-[1.72] tracking-[-0.01em] text-white/60">
              적극적으로 채용공고를 찾지 않아도 됩니다. 이력서를 공개해 두면
              <br className="max-[560px]:hidden" />
              적합한 포지션이 있을 때 기업과 헤드헌터가 먼저 제안합니다.
            </p>
            <div className="mt-8 flex justify-center">
              <MainCta isLoggedIn={isLoggedIn} login={login} />
            </div>
          </div>
        </RevealSection>

        {/* ── 기업 보조 배너 ── */}
        <RevealSection className="mt-5">
          <div
            className="flex flex-wrap items-center justify-between gap-4 border border-[#e5e9ef] bg-white
              px-7 py-5 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-3"
          >
            <div>
              <p className="text-[14.5px] font-semibold text-[#111312]">기업 회원이신가요?</p>
              <p className="mt-0.5 text-[13px] font-normal text-[#596373]">
                제약·바이오·헬스케어 분야의 인재를 직접 발굴하거나 전문 헤드헌팅 서비스를 이용해 보세요.
              </p>
            </div>
            <LinkButton href="/business/headhunting" variant="secondary" size="sm">
              헤드헌팅 의뢰하기
            </LinkButton>
          </div>
        </RevealSection>
      </div>
    </main>
  );
}
