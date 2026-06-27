"use client";

import { Header } from "@/components/Header";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow, SectionIntro, typeScale } from "@/components/ui/Typography";
import { mockResumes } from "@/data/resumes";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

type ResumeState = "none" | "private" | "public";

function getResumeState(): ResumeState {
  if (mockResumes.length === 0) return "none";
  if (mockResumes.some((r) => r.proposalEnabled)) return "public";
  return "private";
}

// 모킹 데이터 기반으로 빌드 타임에 한 번 계산
const RESUME_STATE = getResumeState();

const howItWorks = [
  {
    step: "01",
    title: "이력서 공개",
    description: "이력서에서 '제안 받기'를 켜면 프로필이 기업과 헤드헌터에게 공개됩니다. 언제든지 끌 수 있습니다.",
  },
  {
    step: "02",
    title: "포지션·헤드헌팅 제안 수신",
    description: "직무·경력이 맞는 기업 인사팀 또는 헤드헌터가 포지션을 직접 제안합니다.",
  },
  {
    step: "03",
    title: "검토 후 결정",
    description: "받은 제안 페이지에서 내용을 확인하고 수락·거절을 결정하세요. 진행은 항상 내 선택입니다.",
  },
];

const proposalTypes = [
  {
    label: "포지션 제안",
    description: "기업 인사팀이 직접 제안합니다. 공개 공고에 없는 포지션도 포함될 수 있습니다.",
    detail: "직무 내용·처우 조건·담당 업무가 제안서에 담깁니다.",
  },
  {
    label: "헤드헌팅 제안",
    description: "제약·바이오 전문 헤드헌터가 경력에 맞는 포지션을 발굴해 연결합니다.",
    detail: "헤드헌터가 기업과 포지션 조건을 확인한 뒤 제안하므로 직무 적합도가 높습니다.",
  },
];

function HeroCta({ isLoggedIn, login }: { isLoggedIn: boolean; login: () => void }) {
  if (!isLoggedIn) {
    return (
      <Button variant="gradient" size="lg" onClick={login}>
        로그인하고 시작하기
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
      이력서 작성하기
    </LinkButton>
  );
}

function HeroSubNote({ isLoggedIn }: { isLoggedIn: boolean }) {
  let text: string;
  if (!isLoggedIn) {
    text = "로그인 후 이력서를 공개하면 포지션·헤드헌팅 제안을 받을 수 있어요.";
  } else if (RESUME_STATE === "public") {
    text = "공개된 이력서가 있어요. 기업과 헤드헌터가 포지션을 제안할 수 있습니다.";
  } else if (RESUME_STATE === "private") {
    text = "이력서를 공개하면 포지션·헤드헌팅 제안을 받을 수 있어요.";
  } else {
    text = "이력서를 작성하고 공개하면 포지션·헤드헌팅 제안을 받을 수 있어요.";
  }
  return <p className="mt-3 text-[13px] font-normal text-white/50">{text}</p>;
}

export function HeadhuntingLandingClient() {
  const { isLoggedIn, login } = usePersonalLoginState();

  return (
    <>
      <Header />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative bg-[#050505] px-6 py-24 text-white max-[760px]:py-16"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 55% 65% at 88% 55%, rgba(13,115,105,0.13) 0%, transparent 70%)",
          }}
        >
          <div className="app-shell--default">
            <Eyebrow tone="dark">HEADHUNTING FOR CANDIDATES</Eyebrow>
            <h1 className={`mt-4 max-w-[760px] text-white ${typeScale.heroTitle}`}>
              이력서 하나로
              <br />
              포지션·헤드헌팅 제안을 받으세요.
            </h1>
            <p className="mt-5 max-w-[500px] text-[15px] font-normal leading-[1.75] tracking-[-0.01em] text-white/68">
              공개 이력서를 등록하면 제약·바이오 기업 인사팀과 헤드헌터가 직접
              포지션을 제안합니다. 지원은 내가 결정합니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <HeroCta isLoggedIn={isLoggedIn} login={login} />
              {isLoggedIn && RESUME_STATE !== "none" && (
                <LinkButton href="/mypage/resume" variant="secondary" tone="dark" size="lg">
                  제안 수신 설정
                </LinkButton>
              )}
            </div>
            <HeroSubNote isLoggedIn={isLoggedIn} />
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-white px-6 py-20 max-[760px]:py-14">
          <div className="app-shell--default">
            <SectionIntro eyebrow="HOW IT WORKS" title="세 단계로 시작하세요" />
            <div className="mt-10 grid grid-cols-3 gap-5 max-[760px]:grid-cols-1">
              {howItWorks.map((item) => (
                <div key={item.step} className="border border-[#dfe4ea] bg-white p-6">
                  <p className="text-[22px] font-bold text-[#cfd8e3]">{item.step}</p>
                  <h3 className={`mt-3 text-[#17202c] ${typeScale.cardTitle}`}>{item.title}</h3>
                  <p className="mt-2 text-[13px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Proposal types ── */}
        <section className="bg-[#f5f6f7] px-6 py-20 max-[760px]:py-14">
          <div className="app-shell--default">
            <SectionIntro
              eyebrow="PROPOSAL TYPES"
              title="어떤 제안을 받나요"
              description="포지션·경력이 맞는 기업이나 헤드헌터가 이력서를 보고 직접 제안합니다."
            />
            <div className="mt-10 grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
              {proposalTypes.map((type) => (
                <div key={type.label} className="border border-[#dfe4ea] bg-white p-7">
                  <span
                    className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-white"
                    style={{ backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 2px rgba(5,60,55,0.22)" }}
                  >
                    {type.label}
                  </span>
                  <p className="mt-4 text-[15px] font-semibold leading-[1.55] tracking-[-0.01em] text-[#17202c]">
                    {type.description}
                  </p>
                  <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#68717e]">{type.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[13px] font-normal text-[#8a94a3]">
              이력서 공개 범위는 마이페이지에서 언제든지 조정할 수 있습니다.
            </p>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-[#050505] px-6 py-20 text-center text-white max-[760px]:py-14">
          <div className="app-shell--default">
            <h2 className={`text-white ${typeScale.sectionTitle}`}>
              이직을 고민 중이라면,
              <br className="max-[640px]:hidden" />
              먼저 제안받아보세요.
            </h2>
            <p className="mx-auto mt-4 max-w-[460px] text-[14px] font-normal leading-[1.75] tracking-[-0.01em] text-white/60">
              적극적으로 구직 활동을 하지 않아도 됩니다. 이력서를 공개해 두면
              맞는 포지션이 있을 때 연락이 옵니다.
            </p>
            <div className="mt-8 flex justify-center">
              <HeroCta isLoggedIn={isLoggedIn} login={login} />
            </div>
          </div>
        </section>

        {/* ── Business banner ── */}
        <section className="bg-white px-6 py-8">
          <div className="app-shell--default">
            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#dfe4ea] px-7 py-5 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-3">
              <div>
                <p className="text-[14px] font-semibold text-[#17202c]">기업 회원이신가요?</p>
                <p className="mt-0.5 text-[13px] font-normal text-[#68717e]">
                  제약·바이오 인재를 직접 발굴하거나 헤드헌팅을 의뢰해 보세요.
                </p>
              </div>
              <LinkButton href="/business/headhunting" variant="secondary" size="sm">
                헤드헌팅 의뢰하기
              </LinkButton>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
