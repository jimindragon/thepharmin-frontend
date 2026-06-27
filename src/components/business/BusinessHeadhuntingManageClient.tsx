"use client";

import clsx from "clsx";
import { ChevronDown, ClipboardList, MoreHorizontal, Plus, Search, User, UserCheck, Users, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Pagination } from "@/components/Pagination";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { SectionCard } from "@/components/business/BusinessFormControls";
import {
  candidateStatusClass,
  candidateStatusLabel,
  headhuntingCandidates,
  headhuntingRequests,
  headhuntingStatusClass,
  headhuntingStatusLabel,
  type HeadhuntingCandidateStatus,
  type HeadhuntingRequestStatus,
} from "@/data/headhunting";

type RequestStatusFilter = "all" | HeadhuntingRequestStatus;
type CandidateTabFilter = "all" | "recommended" | "interview" | "offer" | "hired";

const REQUEST_STATUS_OPTIONS: Array<{ id: RequestStatusFilter; label: string }> = [
  { id: "all", label: "전체 상태" },
  { id: "consulting", label: "상담중" },
  { id: "sourcing", label: "후보자 탐색중" },
  { id: "interviewing", label: "면접 진행중" },
  { id: "completed", label: "채용 완료" },
  { id: "on_hold", label: "보류" },
];

const CANDIDATE_TABS: Array<{ id: CandidateTabFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "recommended", label: "추천됨" },
  { id: "interview", label: "면접" },
  { id: "offer", label: "처우 협의" },
  { id: "hired", label: "입사 확정" },
];

const PAGE_SIZE = 5;

function matchesCandidateTab(status: HeadhuntingCandidateStatus, tab: CandidateTabFilter): boolean {
  if (tab === "all") return true;
  if (tab === "recommended") return status === "recommended";
  if (tab === "interview") return status === "interview_proposed" || status === "interview_scheduled";
  if (tab === "offer") return status === "offer";
  if (tab === "hired") return status === "hired";
  return false;
}

function FitScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[72px] bg-[#e5e9ef]">
        <div className="h-full bg-[#111111]" style={{ width: `${score}%` }} />
      </div>
      <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-[#17202c]">{score}</span>
    </div>
  );
}

export function BusinessHeadhuntingManageClient() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateTab, setCandidateTab] = useState<CandidateTabFilter>("all");
  const [candidatePage, setCandidatePage] = useState(1);
  const candidatesSectionRef = useRef<HTMLElement>(null);

  // --- stats ---
  const activeCount = headhuntingRequests.filter(
    (r) => r.status !== "completed" && r.status !== "on_hold",
  ).length;
  const totalCandidates = headhuntingCandidates.length;
  const pendingReviewCount = headhuntingCandidates.filter((c) => c.status === "recommended").length;
  const hiredCount = headhuntingCandidates.filter((c) => c.status === "hired").length;

  // --- request filtering ---
  const filteredRequests = headhuntingRequests.filter((r) => {
    const matchesStatus = requestStatusFilter === "all" || r.status === requestStatusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.positionTitle.toLowerCase().includes(q) ||
      r.jobCategory.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // --- candidate filtering ---
  const scopedCandidates = selectedRequestId
    ? headhuntingCandidates.filter((c) => c.matchedRequestId === selectedRequestId)
    : headhuntingCandidates;

  const tabCounts: Record<CandidateTabFilter, number> = {
    all: scopedCandidates.length,
    recommended: scopedCandidates.filter((c) => c.status === "recommended").length,
    interview: scopedCandidates.filter(
      (c) => c.status === "interview_proposed" || c.status === "interview_scheduled",
    ).length,
    offer: scopedCandidates.filter((c) => c.status === "offer").length,
    hired: scopedCandidates.filter((c) => c.status === "hired").length,
  };

  const filteredCandidates = scopedCandidates.filter((c) =>
    matchesCandidateTab(c.status, candidateTab),
  );
  const pagedCandidates = filteredCandidates.slice(
    (candidatePage - 1) * PAGE_SIZE,
    candidatePage * PAGE_SIZE,
  );

  const requestTitleById = new Map(headhuntingRequests.map((r) => [r.id, r.positionTitle]));

  function handleSelectRequest(id: string) {
    const next = selectedRequestId === id ? null : id;
    setSelectedRequestId(next);
    setCandidateTab("all");
    setCandidatePage(1);
    if (next) {
      requestAnimationFrame(() => {
        candidatesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
          <div>
            <PageBreadcrumb
              items={[
                { label: "기업센터", href: "/business/dashboard" },
                { label: "채용관리" },
                { label: "헤드헌팅 관리" },
              ]}
            />
            <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">
              헤드헌팅 관리
            </h1>
            <p className="mt-2 text-[13px] font-normal text-[#68717e]">
              진행 중인 헤드헌팅 의뢰와 추천 후보자 현황을 확인합니다.
            </p>
          </div>
          <Link
            href="/business/headhunting/manage/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] max-[760px]:w-full"
          >
            <Plus size={15} />새 헤드헌팅 의뢰
          </Link>
        </div>

        {/* 통계 3분할 */}
        <div className="mt-6 grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
          <div className="flex items-center gap-3 border border-[#dfe4ea] bg-white p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#46505f]">
              <ClipboardList size={18} />
            </span>
            <div>
              <p className="text-[12px] font-normal text-[#8a94a3]">진행 중인 의뢰</p>
              <p className="mt-0.5 text-[19px] font-bold tracking-[-0.02em] text-[#17202c]">
                {activeCount}건
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-[#dfe4ea] bg-white p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#46505f]">
              <Users size={18} />
            </span>
            <div>
              <p className="text-[12px] font-normal text-[#8a94a3]">추천 후보자</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <p className="text-[19px] font-bold tracking-[-0.02em] text-[#17202c]">
                  {totalCandidates}명
                </p>
                {pendingReviewCount > 0 && (
                  <span className="text-[12px] font-medium text-[#00746c]">
                    검토 대기 {pendingReviewCount}명
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-[#dfe4ea] bg-white p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#46505f]">
              <UserCheck size={18} />
            </span>
            <div>
              <p className="text-[12px] font-normal text-[#8a94a3]">입사 확정</p>
              <p className="mt-0.5 text-[19px] font-bold tracking-[-0.02em] text-[#17202c]">
                {hiredCount}명
              </p>
            </div>
          </div>
        </div>

        {/* 의뢰 목록 */}
        <div className="mt-6">
          <SectionCard
            title="의뢰 목록"
            description="등록한 헤드헌팅 의뢰의 진행 상태입니다. 의뢰를 선택하면 아래 후보자 현황이 함께 필터링됩니다."
          >
            {/* 필터 행 */}
            <div className="mb-4 flex items-center justify-between gap-3 max-[640px]:flex-col max-[640px]:items-start">
              <div className="relative">
                <select
                  value={requestStatusFilter}
                  onChange={(e) => {
                    setRequestStatusFilter(e.target.value as RequestStatusFilter);
                  }}
                  className="h-10 appearance-none border border-[#cfd8e3] bg-white pl-3 pr-8 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111]"
                >
                  {REQUEST_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a94a3]"
                />
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a4adba]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="포지션·직무 검색"
                  className="h-10 w-[200px] border border-[#d8e0e8] bg-white pl-8 pr-3 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08] max-[640px]:w-full"
                />
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[minmax(0,1fr)_120px_140px_64px_96px_96px_104px] gap-3 border-b border-[#e5e9ef] px-2 pb-3 text-[12px] font-medium text-[#8a94a3]">
                  <span>포지션</span>
                  <span>직무 분야</span>
                  <span>진행 상태</span>
                  <span>인원</span>
                  <span>추천 후보자</span>
                  <span>신청일</span>
                  <span />
                </div>
                {filteredRequests.length > 0 ? (
                  <div className="divide-y divide-[#e5e9ef]">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => handleSelectRequest(request.id)}
                        className={clsx(
                          "grid cursor-pointer grid-cols-[minmax(0,1fr)_120px_140px_64px_96px_96px_104px] items-center gap-3 px-2 py-4 text-[13px] transition",
                          selectedRequestId === request.id
                            ? "bg-[#f7f8fa]"
                            : "hover:bg-[#fafafa]",
                        )}
                      >
                        <span className="font-medium text-[#17202c]">
                          {request.positionTitle}
                        </span>
                        <span className="font-normal text-[#596373]">{request.jobCategory}</span>
                        <span
                          className={clsx(
                            "inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium",
                            headhuntingStatusClass(request.status),
                          )}
                        >
                          {headhuntingStatusLabel(request.status)}
                        </span>
                        <span className="font-normal text-[#303946]">{request.headcount}명</span>
                        <span className="font-normal text-[#303946]">
                          {request.recommendedCandidateCount}명
                        </span>
                        <span className="font-normal text-[#8a94a3]">{request.requestedAt}</span>
                        {/* 후보자 보기 — stopPropagation so click doesn't double-fire */}
                        <div
                          className="flex justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectRequest(request.id)}
                            className={clsx(
                              "inline-flex h-8 items-center justify-center border px-3 text-[12px] font-medium transition",
                              selectedRequestId === request.id
                                ? "border-[#111111] bg-[#111111] text-white"
                                : "border-[#cfd8e3] text-[#303946] hover:border-[#111111] hover:text-[#111111]",
                            )}
                          >
                            후보자 보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <p className="text-[14px] font-medium text-[#303946]">
                      해당하는 의뢰가 없습니다
                    </p>
                    <p className="mt-1.5 text-[13px] font-normal text-[#8a94a3]">
                      조건을 변경해 다시 검색해 보세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 추천 후보자 현황 */}
        <section
          ref={candidatesSectionRef}
          className="mt-5 scroll-mt-[132px] border border-[#dfe4ea] bg-white shadow-[var(--shadow)]"
        >
          <div className="px-6 pt-6 max-[760px]:px-4">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#1f2733]">
              추천 후보자 현황
            </h2>
            <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8491]">
              의뢰별로 추천된 후보자의 진행 상태입니다. 후보자를 선택하면 적합도와 약력을 확인할
              수 있습니다.
            </p>
          </div>

          {/* 상태 탭 */}
          <div className="mt-4 flex items-center overflow-x-auto border-b border-[#e5e9ef] px-6 max-[760px]:px-4">
            {selectedRequestId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRequestId(null);
                  setCandidateTab("all");
                  setCandidatePage(1);
                }}
                className="mr-3 inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[#8a94a3] transition hover:text-[#303946]"
              >
                <X size={11} />
                필터 해제
              </button>
            )}
            {CANDIDATE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCandidateTab(tab.id);
                  setCandidatePage(1);
                }}
                className={clsx(
                  "relative flex h-11 shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                  candidateTab === tab.id
                    ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]"
                    : "text-[#8a94a3] hover:text-[#303946]",
                )}
              >
                {tab.label}
                <span
                  className={clsx(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                    candidateTab === tab.id
                      ? "bg-[#111111] text-white"
                      : "bg-[#f0f1f3] text-[#8a94a3]",
                  )}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* 후보자 테이블 */}
          <div className="overflow-x-auto px-6 pb-2 pt-4 max-[760px]:px-4">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_120px_110px_88px_96px] gap-3 border-b border-[#e5e9ef] pb-3 text-[12px] font-medium text-[#8a94a3]">
                <span>후보자 · 주요 경력</span>
                <span>매칭 포지션</span>
                <span>적합도</span>
                <span>진행 상태</span>
                <span>추천일</span>
                <span />
              </div>
              {pagedCandidates.length > 0 ? (
                <div className="divide-y divide-[#e5e9ef]">
                  {pagedCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_120px_110px_88px_96px] items-center gap-3 py-4 text-[13px]"
                    >
                      {/* 후보자 · 주요 경력: 아이콘 + 코드/라벨 + 경력 텍스트 */}
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#a4adba]">
                          <User size={14} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-[#303946]">{candidate.code}</p>
                            <span className="shrink-0 text-[11px] text-[#8a94a3]">추천 후보자</span>
                          </div>
                          <p className="mt-0.5 text-[13px] font-normal leading-[1.5] text-[#68717e]">
                            {candidate.experienceSummary}
                          </p>
                        </div>
                      </div>
                      {/* 매칭 포지션 */}
                      <span className="w-fit max-w-full truncate border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-1 text-[11px] font-medium text-[#596373]">
                        {requestTitleById.get(candidate.matchedRequestId) ?? "—"}
                      </span>
                      {/* 적합도 */}
                      <FitScoreBar score={candidate.fitScore} />
                      {/* 진행 상태 */}
                      <span
                        className={clsx(
                          "inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium",
                          candidateStatusClass(candidate.status),
                        )}
                      >
                        {candidateStatusLabel(candidate.status)}
                      </span>
                      {/* 추천일 */}
                      <span className="text-[12px] font-normal text-[#8a94a3]">
                        {candidate.recommendedAt}
                      </span>
                      {/* 액션 */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                        >
                          상세
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#cfd8e3] text-[#8a94a3] transition hover:border-[#111111] hover:text-[#111111]"
                          aria-label="더보기"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-[14px] font-medium text-[#303946]">
                    {selectedRequestId
                      ? "해당 의뢰의 후보자가 없습니다"
                      : candidateTab !== "all"
                        ? "해당 상태의 후보자가 없습니다"
                        : "추천된 후보자가 없습니다"}
                  </p>
                  <p className="mt-1.5 text-[13px] font-normal text-[#8a94a3]">
                    헤드헌팅 의뢰를 진행하면 후보자가 이곳에 추천됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {filteredCandidates.length > 0 && (
            <div className="pb-6">
              <Pagination currentPage={candidatePage} onPageChange={setCandidatePage} />
            </div>
          )}
        </section>
      </div>
    </BusinessCenterShell>
  );
}
