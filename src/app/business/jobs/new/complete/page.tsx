"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BoostModal } from "@/components/business/BoostModal";
import { jobPostings } from "@/data/businessJobs";
import type { JobTrack } from "@/types/jobs";
import { jobTrackLabels } from "@/config/jobTracks";
import { BOOST_PRICING, trackToPricingCat, type BoostGrade, type PricingCat } from "@/data/boostPricing";

// ─── Boost grade summary rows (prices sourced from boostPricing.ts) ──────────

const GRADE_INFO: { id: BoostGrade; name: string; location: string; desc: { default: string; pharmacy: string } }[] = [
  {
    id: "premium",
    name: "PREMIUM",
    location: "최상단 추천 영역",
    desc: { default: "웹사이트 최상단부터 전 채널 집중 노출", pharmacy: "웹사이트 최상단 추천 영역에 노출" },
  },
  {
    id: "featured",
    name: "FEATURED",
    location: "상단 추천 영역",
    desc: { default: "상단 추천 노출 + 주요 채널 노출", pharmacy: "상단 추천 영역에 노출" },
  },
  {
    id: "standard",
    name: "STANDARD",
    location: "추천 공고 영역",
    desc: { default: "추천 공고 영역에 안정적으로 노출", pharmacy: "추천 공고 영역에 안정적으로 노출" },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKrw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function formatDeadlineShort(raw: string): string {
  if (raw === "채용 시 마감") return "채용 시 마감";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

// ─── Fallback defaults (shown when URL params are absent) ────────────────────

const FALLBACK = {
  title: "병원 약제팀 약사 채용",
  jobRole: "약국·임상약학",
  deadline: "2026-07-20",
  company: "더팜인제약(주)",
  track: "hospital" as JobTrack,
};

// ─── Main content (needs Suspense due to useSearchParams) ────────────────────

function CompleteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [boostModalOpen, setBoostModalOpen] = useState(false);

  const title = params.get("title") || FALLBACK.title;
  const deadline = formatDeadlineShort(params.get("deadline") || FALLBACK.deadline);
  const track = (params.get("track") || FALLBACK.track) as JobTrack;

  const trackLabel = (jobTrackLabels as Record<string, string>)[track] ?? track;

  // 방금 등록한 공고를 mock 목록에서 찾아 모달 사전 선택 및 가격 조회에 사용
  const matchedJob = jobPostings.find((j) => j.title === title) ?? null;
  const matchedJobId = matchedJob?.id ?? null;

  // 가격 표시용 트랙: 1순위 matchedJob.track, 2순위 URL의 track 원본값. FALLBACK("hospital")은 가격 결정에 사용하지 않음.
  const urlTrackParam = params.get("track");
  const pricingTrack: JobTrack | null = matchedJob?.track ?? (urlTrackParam ? (urlTrackParam as JobTrack) : null);
  const pricingCat: PricingCat | null = pricingTrack ? trackToPricingCat(pricingTrack) : null;

  return (
    <div className="pb-12">
      {/* 브레드크럼 — 공고 등록 페이지와 동일한 위치·체계 */}
      <PageBreadcrumb
        items={[
          { label: "기업센터", href: "/business/dashboard" },
          { label: "채용관리", href: "/business/jobs" },
          { label: "공고 등록 완료" },
        ]}
      />

      {/* 성공 헤더 */}
      <div className="mt-10 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center bg-[#111111]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-5 text-[28px] font-black tracking-[-0.025em] text-[#17202c]">
          공고가 등록되었습니다
        </h1>
        <p className="mt-2 text-[14px] font-normal leading-[1.7] text-[#68717e]">
          등록한 공고는 채용공고 목록에 무료로 노출됩니다.
        </p>
      </div>

      {/* 공고 요약 카드 + 부스트 카드 */}
      <div className="mx-auto mt-8 max-w-[680px]">
        {/* 공고 요약 카드 */}
        <div className="surface px-8 py-4 max-[480px]:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">{title}</span>
                <span className="shrink-0 border border-[#d3d9e1] bg-white px-2 py-0.5 text-[12px] font-medium text-[#596373]">
                  {trackLabel}
                </span>
              </div>
              <p className="mt-1 text-[13px] font-normal text-[#8a9ab0]">
                게시중 · ~{deadline}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* 공고 상세(/business/jobs/[id]) 미구현 */}
              <button
                type="button"
                disabled
                title="공고 상세 페이지는 준비 중입니다"
                className="border border-[#d8e0e8] bg-white px-4 py-2 text-[13px] font-medium text-[#9aa4b2] disabled:cursor-not-allowed"
              >
                공고 보기
              </button>
              <button
                type="button"
                onClick={() => router.push("/business/jobs")}
                className="border border-[#d8e0e8] bg-white px-4 py-2 text-[13px] font-medium text-[#596373] transition hover:border-[#b0bac6] hover:text-[#17202c]"
              >
                공고 관리로 이동
              </button>
            </div>
          </div>
        </div>

        {/* 부스트 유도 카드 */}
        <div className="surface mt-6 px-8 py-6 max-[480px]:px-5">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8a9ab0]">선택 사항</p>
          <h2 className="mt-1.5 text-[20px] font-black tracking-[-0.02em] text-[#17202c]">
            공고 노출을 더 높여볼까요?
          </h2>
          <p className="mt-2 text-[13px] font-normal leading-[1.7] text-[#68717e]">
            부스트를 적용하면 공고가 추천 영역에 노출되어 더 많은 인재에게 도달합니다.
          </p>

          {/* 등급 요약 행 */}
          <div className="mt-5 divide-y divide-[#f0f3f6]">
            {GRADE_INFO.map((g) => {
              const amount = pricingCat ? BOOST_PRICING[g.id][pricingCat][0].discountedKrw : null;
              const desc = pricingCat === "pharmacy" ? g.desc.pharmacy : g.desc.default;
              return (
                <div key={g.id} className="flex items-start justify-between gap-4 py-5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a9ab0]">{g.name}</p>
                    <p className="mt-1 text-[16px] font-bold tracking-[-0.01em] text-[#17202c]">{g.location}</p>
                    <p className="mt-1 text-[13px] font-normal text-[#8a9ab0]">{desc}</p>
                  </div>
                  {amount !== null && (
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-normal text-[#8a9ab0]">1주 기준</p>
                      <p className="mt-1 text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">{formatKrw(amount)}~</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 하단 안내 문구 */}
          <p className="mt-4 border-t border-[#f0f3f6] pt-4 text-[12px] font-normal text-[#8a9ab0]">
            {pricingCat ? "오픈 기념 1년 한정 프로모션가 적용 · VAT 별도" : "공고 정보를 확인한 뒤 상품별 금액이 표시됩니다."}
          </p>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-end gap-3 max-[480px]:flex-col max-[480px]:items-stretch">
            <button
              type="button"
              onClick={() => router.push("/business/jobs")}
              className="text-[13px] font-medium text-[#596373] transition hover:text-[#17202c] max-[480px]:py-2"
            >
              나중에 하기
            </button>
            <button
              type="button"
              onClick={() => setBoostModalOpen(true)}
              className="inline-flex h-11 items-center justify-center px-6 text-[14px] font-bold text-white transition hover:brightness-110 max-[480px]:w-full"
              style={{ backgroundImage: "var(--gradient-cta)" }}
            >
              부스트 적용하기
            </button>
          </div>
        </div>
      </div>

      <BoostModal
        open={boostModalOpen}
        onClose={() => setBoostModalOpen(false)}
        preselectedJobId={matchedJobId}
      />
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function JobPostingCompletePage() {
  return (
    <BusinessCenterShell>
      <Suspense
        fallback={
          <div className="py-20 text-center text-[14px] text-[#9aa4b2]">로딩 중…</div>
        }
      >
        <CompleteContent />
      </Suspense>
    </BusinessCenterShell>
  );
}
