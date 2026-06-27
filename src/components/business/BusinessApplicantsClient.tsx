"use client";

import clsx from "clsx";
import {
  ChevronDown,
  ChevronRight,
  Download,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import {
  applicantJobPostings,
  applicants,
  applicantStageClass,
  applicantStageLabel,
  STAGE_TABS,
  type ApplicantStageFilter,
} from "@/data/applicants";

const PAGE_SIZE = 5;

const SORT_OPTIONS = [
  { id: "fit" as const, label: "적합도순" },
  { id: "date" as const, label: "지원일순" },
  { id: "name" as const, label: "이름순" },
];
type SortOption = "fit" | "date" | "name";

function FitScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[72px] bg-[#e5e9ef]">
        <div className="h-full bg-[#111111]" style={{ width: `${score}%` }} />
      </div>
      <span className="w-6 text-right text-[13px] font-semibold tabular-nums text-[#17202c]">
        {score}
      </span>
    </div>
  );
}

export function BusinessApplicantsClient() {
  const [selectedPostingId, setSelectedPostingId] = useState<string>("all");
  const [stageTab, setStageTab] = useState<ApplicantStageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("fit");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Scoped applicants (by selected posting)
  const scopedApplicants =
    selectedPostingId === "all"
      ? applicants
      : applicants.filter((a) => a.postingId === selectedPostingId);

  // Stats
  const newCount = scopedApplicants.filter((a) => a.isNew).length;
  const reviewCount = scopedApplicants.length;
  const interviewApplicants = scopedApplicants.filter((a) => a.interviewDate != null);
  const interviewCount = interviewApplicants.length;
  const nearInterviewCount = interviewApplicants.filter(
    (a) => (a.daysUntilInterview ?? Infinity) <= 2,
  ).length;
  const offerCount = scopedApplicants.filter((a) => a.stage === "offer").length;

  // Tab counts
  const tabCounts: Record<ApplicantStageFilter, number> = {
    all: scopedApplicants.length,
    new: scopedApplicants.filter((a) => a.stage === "new").length,
    screening: scopedApplicants.filter((a) => a.stage === "screening").length,
    first_interview: scopedApplicants.filter((a) => a.stage === "first_interview").length,
    final_interview: scopedApplicants.filter((a) => a.stage === "final_interview").length,
    offer: scopedApplicants.filter((a) => a.stage === "offer").length,
    rejected: scopedApplicants.filter((a) => a.stage === "rejected").length,
  };

  // Filter + sort
  const filtered = scopedApplicants
    .filter((a) => {
      if (stageTab !== "all" && a.stage !== stageTab) return false;
      const q = searchQuery.trim().toLowerCase();
      if (q && !a.name.includes(q) && !a.skills.some((s) => s.toLowerCase().includes(q)))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "fit") return b.fitScore - a.fitScore || a.daysAgo - b.daysAgo;
      if (sortBy === "date") return a.daysAgo - b.daysAgo;
      return a.name.localeCompare(b.name, "ko");
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Checkbox
  const allChecked = paged.length > 0 && paged.every((a) => selectedIds.has(a.id));
  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) paged.forEach((a) => next.delete(a.id));
      else paged.forEach((a) => next.add(a.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePostingChange(id: string) {
    setSelectedPostingId(id);
    setStageTab("all");
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleTabChange(tab: ApplicantStageFilter) {
    setStageTab(tab);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearchQuery(value);
    setPage(1);
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
                { label: "지원자 관리" },
              ]}
            />
            <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">
              지원자 관리
            </h1>
            <p className="mt-2 text-[13px] font-normal text-[#68717e]">
              공고별 지원자를 단계별로 관리하고, 서류·면접 진행 상황을 한 곳에서 확인하세요.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-[#cfd8e3] bg-white px-5 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111] max-[760px]:w-full"
          >
            <Download size={15} />
            내보내기
          </button>
        </div>

        {/* 통계 4분할 */}
        <BusinessStatGrid cols={4}>
          <BusinessStatCard
            label="신규 지원"
            value={String(newCount)}
            unit="명"
            sub="최근 7일"
          />
          <BusinessStatCard
            label="검토 진행 중"
            value={String(reviewCount)}
            unit="명"
          />
          <BusinessStatCard
            label="면접 예정"
            value={String(interviewCount)}
            unit="명"
            subEmphasis={nearInterviewCount > 0 ? `D-2 이내 ${nearInterviewCount}명` : undefined}
            emphasisVariant="urgent"
          />
          <BusinessStatCard
            label="합격 제안"
            value={String(offerCount)}
            unit="명"
          />
        </BusinessStatGrid>

        {/* 지원자 목록 */}
        <section className="mt-6 border border-[#dfe4ea] bg-white shadow-[var(--shadow)]">
          <div className="px-6 pt-6 max-[760px]:px-4">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#1f2733]">
              지원자 목록
            </h2>
            <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8491]">
              공고를 선택해 지원자를 단계별로 관리하세요. 직무 적합도는 이력서 항목과 공고 요건의
              일치도로 산정됩니다.
            </p>
          </div>

          {/* 필터 행 */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-6 max-[760px]:px-4">
            <div className="relative">
              <select
                value={selectedPostingId}
                onChange={(e) => handlePostingChange(e.target.value)}
                className="h-10 appearance-none border border-[#cfd8e3] bg-white pl-3 pr-8 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] max-[640px]:w-full"
              >
                <option value="all">전체 공고</option>
                {applicantJobPostings.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.category}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a94a3]"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a4adba]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="지원자 이름·직무 검색"
                  className="h-10 w-[220px] border border-[#d8e0e8] bg-white pl-8 pr-3 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08] max-[640px]:w-full"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setPage(1);
                  }}
                  className="h-10 appearance-none border border-[#cfd8e3] bg-white pl-3 pr-7 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8a94a3]"
                />
              </div>
            </div>
          </div>

          {/* 단계 탭 */}
          <div className="mt-4 flex items-center overflow-x-auto border-b border-[#e5e9ef] px-6 max-[760px]:px-4">
            {STAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  "relative flex h-11 shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                  stageTab === tab.id
                    ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]"
                    : "text-[#8a94a3] hover:text-[#303946]",
                )}
              >
                {tab.label}
                <span
                  className={clsx(
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                    stageTab === tab.id
                      ? "bg-[#111111] text-white"
                      : "bg-[#f0f1f3] text-[#8a94a3]",
                  )}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto px-6 pb-2 pt-4 max-[760px]:px-4">
            <div className="min-w-[900px]">
              {/* 헤더 행 */}
              <div className="grid grid-cols-[32px_minmax(0,2fr)_minmax(0,3fr)_164px_104px_104px_152px] items-center gap-3 border-b border-[#e5e9ef] pb-3 text-[12px] font-medium text-[#8a94a3]">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer accent-[#111111]"
                />
                <span>지원자</span>
                <span>핵심 경력</span>
                <span>직무 적합도</span>
                <span>현재 단계</span>
                <span>지원일</span>
                <span />
              </div>

              {/* 데이터 행 */}
              {paged.length > 0 ? (
                <div className="divide-y divide-[#e5e9ef]">
                  {paged.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="grid grid-cols-[32px_minmax(0,2fr)_minmax(0,3fr)_164px_104px_104px_152px] items-center gap-3 py-4 text-[13px]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(applicant.id)}
                        onChange={() => toggleOne(applicant.id)}
                        className="h-4 w-4 cursor-pointer accent-[#111111]"
                      />

                      {/* 지원자 */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#17202c]">{applicant.name}</span>
                          {applicant.isNew && (
                            <span className="inline-flex h-[18px] items-center justify-center border border-[#bfe7e2] bg-[#eafbf8] px-1.5 text-[10px] font-bold uppercase tracking-wide text-[#00746c]">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">
                          {applicant.age}세 · 경력 {applicant.experienceYears}년 ·{" "}
                          {applicant.location}
                        </p>
                      </div>

                      {/* 핵심 경력 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.map((skill) => (
                          <span
                            key={skill}
                            className="border border-[#dfe4ea] bg-[#f7f8fa] px-2 py-0.5 text-[11px] font-medium text-[#596373]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* 직무 적합도 */}
                      <div>
                        <FitScoreBar score={applicant.fitScore} />
                        <p className="mt-1 text-[11px] font-normal text-[#8a94a3]">
                          {applicant.fitTotal}개 요건 중 {applicant.fitMet}개 충족
                        </p>
                      </div>

                      {/* 현재 단계 */}
                      <span
                        className={clsx(
                          "inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium",
                          applicantStageClass(applicant.stage),
                        )}
                      >
                        {applicantStageLabel(applicant.stage)}
                      </span>

                      {/* 지원일 */}
                      <div>
                        <p className="text-[12px] font-normal text-[#303946]">
                          {applicant.appliedAt}
                        </p>
                        <p className="mt-0.5 text-[11px] font-normal text-[#8a94a3]">
                          {applicant.daysAgo}일 전 지원
                        </p>
                      </div>

                      {/* 액션 */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                        >
                          프로필
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap border border-[#dfe4ea] bg-[#f7f8fa] px-3 text-[12px] font-medium text-[#596373] transition hover:border-[#b0bac6] hover:text-[#303946]"
                        >
                          단계 이동
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
                    {searchQuery ? "검색 결과가 없습니다" : "해당하는 지원자가 없습니다"}
                  </p>
                  <p className="mt-1.5 text-[13px] font-normal text-[#8a94a3]">
                    {searchQuery
                      ? "검색어를 변경해 다시 시도해 보세요."
                      : "조건을 변경해 다시 확인해 보세요."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center pb-6" aria-label="지원자 목록 페이지">
              <div className="flex h-[38px] items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={clsx(
                      "h-[38px] w-[46px] border border-r-0 border-[#dce2ea] text-[13px] font-medium",
                      page === p
                        ? "bg-[#050505] text-white"
                        : "bg-white text-[#5c6675] hover:bg-[#f5f5f5]",
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  className="flex h-[38px] items-center gap-2 border border-[#dce2ea] bg-white px-4 text-[13px] font-medium text-[#5c6675] hover:bg-[#f5f5f5]"
                >
                  다음
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          )}
        </section>
      </div>
    </BusinessCenterShell>
  );
}
