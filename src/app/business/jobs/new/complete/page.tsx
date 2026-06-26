"use client";

import clsx from "clsx";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BoostModal } from "@/components/business/BoostModal";
import { jobPostings } from "@/data/businessJobs";
import type { JobTrack } from "@/types/jobs";
import { jobTrackLabels } from "@/config/jobTracks";

// ─── Boost option data (same values as BusinessPricingClient) ────────────────

interface BoostOption {
  id: string;
  label: string;
  originalKrw: number;
  discountedKrw: number;
  discountPct: number;
}

const BOOST_OPTIONS: BoostOption[] = [
  { id: "1w", label: "부스트 1주", originalKrw: 120000, discountedKrw: 84000, discountPct: 30 },
  { id: "2w", label: "부스트 2주", originalKrw: 228000, discountedKrw: 148000, discountPct: 35 },
  { id: "4w", label: "부스트 4주", originalKrw: 432000, discountedKrw: 259000, discountPct: 40 },
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

function personLabel(track: string): string {
  const map: Partial<Record<JobTrack, string>> = {
    industry: "제약·바이오 인재",
    research: "연구 인재",
    hospital: "약사",
    pharmacy: "약사",
  };
  return map[track as JobTrack] ?? "약사·의료 인재";
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
  const [selectedBoost, setSelectedBoost] = useState<string>("4w");
  const [boostModalOpen, setBoostModalOpen] = useState(false);

  const title = params.get("title") || FALLBACK.title;
  const deadline = formatDeadlineShort(params.get("deadline") || FALLBACK.deadline);
  const track = (params.get("track") || FALLBACK.track) as JobTrack;

  const trackLabel = (jobTrackLabels as Record<string, string>)[track] ?? track;
  const person = personLabel(track);
  const selectedOption = BOOST_OPTIONS.find((o) => o.id === selectedBoost);

  // 방금 등록한 공고를 mock 목록에서 찾아 모달 사전 선택에 사용
  const matchedJobId = jobPostings.find((j) => j.title === title)?.id ?? null;

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
      <div className="mx-auto mt-8 max-w-[680px] space-y-4">
        {/* 공고 요약 카드 */}
        <div className="surface px-5 py-4">
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
            {/* 공고 상세(/business/jobs/[id]) 미구현 */}
            <button
              type="button"
              disabled
              title="공고 상세 페이지는 준비 중입니다"
              className="shrink-0 border border-[#d8e0e8] bg-white px-4 py-2 text-[13px] font-medium text-[#9aa4b2] disabled:cursor-not-allowed"
            >
              공고 보기
            </button>
          </div>
        </div>

        {/* 부스트 유도 카드 */}
        <div className="surface px-5 py-6">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#8a9ab0]">선택 사항</p>
          <h2 className="mt-1.5 text-[20px] font-black tracking-[-0.02em] text-[#17202c]">
            더 많은 {person}에게 이 공고를 노출할까요?
          </h2>
          <p className="mt-2 text-[13px] font-normal leading-[1.7] text-[#68717e]">
            부스트를 적용하면 공고가 목록 상단에 노출되고, 관련 직무 인재에게 알림이 발송됩니다. 기간을 선택해 바로 적용할 수 있습니다.
          </p>

          {/* 라디오 옵션 */}
          <div className="mt-5 space-y-2.5">
            {BOOST_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={clsx(
                  "flex cursor-pointer items-center justify-between gap-3 border px-4 py-3.5 transition-colors",
                  selectedBoost === opt.id
                    ? "border-[#17A68C] bg-[#f4fdf9]"
                    : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="boost"
                    value={opt.id}
                    checked={selectedBoost === opt.id}
                    onChange={() => setSelectedBoost(opt.id)}
                    className="h-[18px] w-[18px] cursor-pointer accent-[#17A68C]"
                  />
                  <span className="text-[15px] font-bold text-[#17202c]">{opt.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="border border-[#e2998a] px-1.5 py-0.5 text-[11px] font-medium text-[#c0523b]">
                    {opt.discountPct}%
                  </span>
                  <span className="text-[13px] text-[#a0a9b7] line-through">
                    {formatKrw(opt.originalKrw)}
                  </span>
                  <span className="text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
                    {formatKrw(opt.discountedKrw)}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* 하단 액션 바 */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f3f6] pt-4 max-[480px]:flex-col max-[480px]:items-stretch">
            <p className="text-[12px] font-normal text-[#8a9ab0]">오픈 1년 입점 할인 적용 · VAT 별도</p>
            <div className="flex items-center gap-3 max-[480px]:flex-col">
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
                {selectedOption ? `${formatKrw(selectedOption.discountedKrw)} 결제하기` : "결제하기"}
              </button>
            </div>
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
