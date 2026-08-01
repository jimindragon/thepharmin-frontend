"use client";

import clsx from "clsx";
import { ChevronDown, MoreHorizontal, Plus, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Pagination } from "@/components/Pagination";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { FitScoreBar } from "@/components/business/FitScoreBar";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import { DataTable, type DataTableColumn } from "@/components/business/table/DataTable";
import { StatusPill } from "@/components/business/table/StatusPill";
import {
  candidateStatusLabel,
  HEADHUNTING_CANDIDATE_TONE,
  HEADHUNTING_REQUEST_TONE,
  headhuntingCandidates,
  headhuntingJobCategoryLabel,
  headhuntingJobSubcategoryLabel,
  headhuntingRequests,
  headhuntingStatusLabel,
  type HeadhuntingCandidate,
  type HeadhuntingCandidateStatus,
  type HeadhuntingRequest,
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

export function BusinessHeadhuntingManageClient() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateTab, setCandidateTab] = useState<CandidateTabFilter>("all");
  const [candidatePage, setCandidatePage] = useState(1);
  const candidatesSectionRef = useRef<HTMLDivElement>(null);

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
      headhuntingJobSubcategoryLabel(r.jobCategoryId, r.jobSubcategoryId).toLowerCase().includes(q);
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

  // 열 정의 — grid-cols는 DataTable이 여기서 한 번만 조립한다(헤더·행 복제 해소).
  // 액션 셀이 selectedRequestId·handleSelectRequest를 읽어야 해서 컴포넌트 안에 둔다.
  const REQUEST_COLUMNS: DataTableColumn<HeadhuntingRequest>[] = [
    {
      key: "position",
      header: "포지션",
      width: "minmax(0,1fr)",
      cell: (request) => (
        <span className="text-[16px] font-semibold text-[#17202c]">{request.positionTitle}</span>
      ),
    },
    {
      key: "category",
      header: "직무 분야",
      width: "120px",
      cell: (request) => (
        <span className="font-normal text-[#596373]">
          {headhuntingJobCategoryLabel(request.jobCategoryId)} ·{" "}
          {headhuntingJobSubcategoryLabel(request.jobCategoryId, request.jobSubcategoryId)}
        </span>
      ),
    },
    {
      key: "status",
      header: "진행 상태",
      width: "140px",
      cell: (request) => (
        <StatusPill
          tone={HEADHUNTING_REQUEST_TONE[request.status]}
          label={headhuntingStatusLabel(request.status)}
        />
      ),
    },
    {
      key: "headcount",
      header: "인원",
      width: "64px",
      cell: (request) => <span className="font-normal text-[#303946]">{request.headcount}명</span>,
    },
    {
      key: "candidates",
      header: "추천 후보자",
      width: "96px",
      cell: (request) => (
        <span className="text-[14px] font-semibold text-[#303946]">
          {request.recommendedCandidateCount}명
        </span>
      ),
    },
    {
      key: "requestedAt",
      header: "신청일",
      width: "96px",
      cell: (request) => <span className="font-normal text-[#8a94a3]">{request.requestedAt}</span>,
    },
    {
      key: "action",
      width: "104px",
      align: "end",
      cell: (request) => (
        // stopPropagation — 행 클릭과 버튼 클릭이 겹쳐 두 번 실행되지 않게 한다
        <span onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleSelectRequest(request.id)}
            className={clsx(
              "inline-flex h-8 items-center justify-center border px-3 text-[13px] font-medium transition",
              selectedRequestId === request.id
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#cfd8e3] text-[#303946] hover:border-[#111111] hover:text-[#111111]",
            )}
          >
            후보자 보기
          </button>
        </span>
      ),
    },
  ];

  const CANDIDATE_COLUMNS: DataTableColumn<HeadhuntingCandidate>[] = [
    {
      key: "candidate",
      header: "후보자 · 주요 경력",
      width: "minmax(0,3fr)",
      cell: (candidate) => (
        // 아이콘 + 코드/라벨 + 경력 텍스트
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-[#dfe4ea] bg-[#f7f8fa] text-[#a4adba]">
            <User size={14} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[16px] font-semibold text-[#17202c]">{candidate.code}</p>
              <span className="shrink-0 text-[11px] text-[#8a94a3]">추천 후보자</span>
            </div>
            <p className="mt-0.5 text-[13px] font-normal leading-[1.5] text-[#8a94a3]">
              {candidate.experienceSummary}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "matchedPosition",
      header: "매칭 포지션",
      width: "minmax(0,2fr)",
      cell: (candidate) => (
        // block — 셀 래퍼 안에서는 인라인이 되어 truncate(overflow:hidden)가 먹지 않는다.
        // 그리드 직속일 때는 blockify로 자동이었지만 지금은 명시해야 한다.
        <span className="block w-fit max-w-full truncate border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-1 text-[12px] font-medium text-[#596373]">
          {requestTitleById.get(candidate.matchedRequestId) ?? "—"}
        </span>
      ),
    },
    {
      key: "fit",
      header: "적합도",
      width: "120px",
      cell: (candidate) => (
        <div>
          <FitScoreBar score={candidate.fitScore} />
          <p className="mt-1 text-[13px] font-normal text-[#8a94a3]">
            {candidate.fitTotal}개 요건 중 {candidate.fitMet}개 충족
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "진행 상태",
      width: "110px",
      cell: (candidate) => (
        <StatusPill
          tone={HEADHUNTING_CANDIDATE_TONE[candidate.status]}
          label={candidateStatusLabel(candidate.status)}
        />
      ),
    },
    {
      key: "recommendedAt",
      header: "추천일",
      width: "88px",
      cell: (candidate) => (
        <span className="text-[13px] font-normal text-[#8a94a3]">{candidate.recommendedAt}</span>
      ),
    },
    {
      key: "action",
      width: "104px",
      align: "end",
      cell: () => (
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center whitespace-nowrap border border-[#cfd8e3] px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
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
        </span>
      ),
    },
  ];

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
                { label: "헤드헌팅" },
                { label: "의뢰 관리" },
              ]}
            />
            <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">
              헤드헌팅 관리
            </h1>
            <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
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
        <BusinessStatGrid cols={3}>
          <BusinessStatCard
            label="진행 중인 의뢰"
            value={String(activeCount)}
            unit="건"
          />
          <BusinessStatCard
            label="추천 후보자"
            value={String(totalCandidates)}
            unit="명"
            sub={pendingReviewCount > 0 ? `검토 대기 ${pendingReviewCount}명` : undefined}
          />
          <BusinessStatCard
            label="입사 확정"
            value={String(hiredCount)}
            unit="명"
          />
        </BusinessStatGrid>

        {/* 의뢰 목록 */}
        <div className="mt-6">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]">의뢰 목록</h2>
          <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8491]">
            등록한 헤드헌팅 의뢰의 진행 상태입니다. 의뢰를 선택하면 아래 후보자 현황이 함께 필터링됩니다.
          </p>

          {/* 필터 행 */}
          <div className="mt-4 flex items-center justify-between gap-3 max-[640px]:flex-col max-[640px]:items-start">
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
          <DataTable
            columns={REQUEST_COLUMNS}
            rows={filteredRequests}
            rowKey={(request) => request.id}
            /* 873(기존 트랙 폭) + 좌우 패딩 48 — 패딩이 행 안으로 들어와 총폭에 포함된다 */
            minWidth={921}
            onRowClick={(request) => handleSelectRequest(request.id)}
            isRowSelected={(request) => selectedRequestId === request.id}
            empty={{
              title: "해당하는 의뢰가 없습니다",
              description: "조건을 변경해 다시 검색해 보세요.",
            }}
          />
        </div>

        {/* 추천 후보자 현황 */}
        <div ref={candidatesSectionRef} className="mt-6 scroll-mt-[132px]">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]">
            추천 후보자 현황
          </h2>
          <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8491]">
            의뢰별로 추천된 후보자의 진행 상태입니다. 후보자를 선택하면 적합도와 약력을 확인할
            수 있습니다.
          </p>

          {/* 상태 탭 */}
          <div className="mt-4 flex items-center overflow-x-auto border-b border-border">
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

          {/* 테이블 카드 */}
          <DataTable
            columns={CANDIDATE_COLUMNS}
            rows={pagedCandidates}
            rowKey={(candidate) => candidate.id}
            minWidth={921}
            empty={{
              title: selectedRequestId
                ? "해당 의뢰의 후보자가 없습니다"
                : candidateTab !== "all"
                  ? "해당 상태의 후보자가 없습니다"
                  : "추천된 후보자가 없습니다",
              description: "헤드헌팅 의뢰를 진행하면 후보자가 이곳에 추천됩니다.",
            }}
            pagination={
              filteredCandidates.length > 0 ? (
                <div className="pb-6">
                  <Pagination currentPage={candidatePage} onPageChange={setCandidatePage} />
                </div>
              ) : undefined
            }
          />
        </div>
      </div>
    </BusinessCenterShell>
  );
}
