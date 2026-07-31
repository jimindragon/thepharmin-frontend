"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BoostModal } from "@/components/business/BoostModal";
import {
  filterJobPostings,
  getClosingDday,
  jobPostings,
  jobTrackLabel,
  type JobPostingStatusFilter,
} from "@/data/businessJobs";

const STATUS_TABS: Array<{ id: JobPostingStatusFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "pending", label: "검토 대기" },
  { id: "active", label: "게시 중" },
  { id: "closed", label: "마감" },
];

const EXTEND_DISABLED_TITLE = "게시 중인 공고만 연장할 수 있습니다.";

export function BusinessJobsClient() {
  const [statusFilter, setStatusFilter] = useState<JobPostingStatusFilter>("all");
  const [boostModalJobId, setBoostModalJobId] = useState<string | null>(null);

  const filtered = filterJobPostings(jobPostings, statusFilter);
  const hasJobs = filtered.length > 0;

  const tabCounts: Record<JobPostingStatusFilter, number> = {
    all: jobPostings.length,
    pending: jobPostings.filter((p) => p.status === "pending").length,
    active: jobPostings.filter((p) => p.status === "active").length,
    closed: jobPostings.filter((p) => p.status === "closed").length,
  };

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "채용관리" },
              { label: "공고 관리" },
            ]}
          />
          <h1 className="mt-5 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">공고 관리</h1>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            등록한 공고를 관리하고, 공고별로 부스트를 적용할 수 있습니다.
          </p>
        </div>

        {/* 상태 탭 */}
        <div className="mt-6 flex items-center overflow-x-auto border-b border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={clsx(
                "relative flex h-11 shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                statusFilter === tab.id
                  ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]"
                  : "text-[#8a94a3] hover:text-[#303946]",
              )}
              aria-pressed={statusFilter === tab.id}
            >
              {tab.label}
              <span
                className={clsx(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                  statusFilter === tab.id
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
        <div className="mt-3 border border-border bg-white">
          {hasJobs ? (
            <div className="overflow-x-auto">
              <div className="min-w-[940px]">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[minmax(0,1fr)_80px_80px_90px_130px_120px] gap-4 border-b border-border px-5 py-3 text-[13px] font-medium text-[#8a94a3]">
                  <span>공고</span>
                  <span>상태</span>
                  <span>지원자</span>
                  <span>등록일</span>
                  <span>마감일</span>
                </div>

                {/* 테이블 행 */}
                <div className="divide-y divide-[#e5e9ef]">
                  {filtered.map((posting) => {
                    const isClosed = posting.status === "closed";
                    const isPending = posting.status === "pending";
                    const isActive = posting.status === "active";
                    const { boost } = posting;
                    const dday =
                      isActive && posting.closingDate ? getClosingDday(posting.closingDate) : null;

                    return (
                      <div
                        key={posting.id}
                        className="grid grid-cols-[minmax(0,1fr)_80px_80px_90px_130px_120px] items-center gap-4 px-5 py-4"
                      >
                        {/* 공고 */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p
                              className={clsx(
                                "text-[16px] font-semibold",
                                isClosed ? "text-[#8a94a3]" : "text-[#17202c]",
                              )}
                            >
                              {posting.title}
                            </p>
                            {/* leading-4: body의 line-height 1.65가 배지 안까지 상속되는 것을 끊은 국소 예외. 트랙 배지 4곳(본화면 3 + 영수증 모달)이 같은 처방을 쓴다 — 배지 높이를 전역 정리할 때 함께 볼 것 */}
                            <span className="inline-flex h-6 items-center border border-[#d8e0e8] px-1.5 text-[13px] font-medium leading-4 text-[#596373]">
                              {jobTrackLabel(posting.track)}
                            </span>
                          </div>
                        </div>

                        {/* 상태 */}
                        <span className="inline-flex w-fit items-center gap-[8px]">
                          <span
                            className={clsx(
                              "h-[8px] w-[8px] rounded-full shrink-0",
                              isClosed
                                ? "bg-status-neutral-dot"
                                : isPending
                                  ? "bg-status-warning-dot"
                                  : "bg-status-positive-dot",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-[13px] font-medium",
                              isClosed
                                ? "text-[#8a94a3]"
                                : isPending
                                  ? "text-status-warning"
                                  : "text-status-positive",
                            )}
                          >
                            {isClosed ? "마감" : isPending ? "검토 대기" : "게시 중"}
                          </span>
                        </span>

                        {/* 지원자 */}
                        {isPending ? (
                          <span className="text-[13px] text-[#8a94a3]">—</span>
                        ) : (
                          <span
                            className={clsx(
                              "text-[14px] font-semibold",
                              isClosed ? "text-[#8a94a3]" : "text-[#17202c]",
                            )}
                          >
                            {posting.applicantCount}명
                          </span>
                        )}

                        {/* 등록일 */}
                        <span className="text-[13px] font-normal text-[#8a94a3]">
                          {posting.registeredAt}
                        </span>

                        {/* 마감일 */}
                        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <p className="text-[13px] font-normal text-[#8a94a3]">
                            {posting.closingDate ?? "마감됨"}
                          </p>
                          {dday && (
                            <span
                              className={clsx(
                                "text-[13px] font-semibold",
                                dday.isUrgent ? "text-status-urgent" : "text-status-positive",
                              )}
                            >
                              D-{dday.daysLeft}
                            </span>
                          )}
                        </div>

                        {/* 액션 */}
                        <div className="flex justify-end">
                          {isClosed || isPending ? (
                            <button
                              type="button"
                              disabled
                              title={EXTEND_DISABLED_TITLE}
                              aria-label={EXTEND_DISABLED_TITLE}
                              className="inline-flex h-9 w-[108px] cursor-not-allowed items-center justify-center border border-[#e5e9ef] px-4 text-[13px] font-medium text-[#c0c8d2]"
                            >
                              연장
                            </button>
                          ) : boost ? (
                            <Link
                              href="/business/billing/plans"
                              className="inline-flex h-9 w-[108px] items-center justify-center border border-[#cfd8e3] px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                            >
                              연장
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBoostModalJobId(posting.id)}
                              className="inline-flex h-9 w-[108px] items-center justify-center gap-1 border border-[#111111] bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:border-[#303946] hover:bg-[#303946]"
                            >
                              <span>↑</span>
                              <span>부스트</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* 빈 상태 */
            <div className="py-20 text-center">
              <p className="text-[15px] font-medium text-[#303946]">
                {statusFilter === "active"
                  ? "게시 중인 공고가 없습니다"
                  : statusFilter === "closed"
                    ? "마감된 공고가 없습니다"
                    : "등록된 공고가 없습니다"}
              </p>
              <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
                {statusFilter === "all"
                  ? "공고를 등록하면 여기서 관리할 수 있습니다."
                  : "조건에 해당하는 공고가 없습니다."}
              </p>
              {statusFilter === "all" && (
                <Link
                  href="/business/jobs/new"
                  className="mt-6 inline-flex h-10 items-center justify-center border border-[#111111] bg-[#111111] px-6 text-[13px] font-semibold text-white transition hover:bg-[#303946]"
                >
                  공고 등록하기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <BoostModal
        open={boostModalJobId !== null}
        onClose={() => setBoostModalJobId(null)}
        preselectedJobId={boostModalJobId}
      />
    </BusinessCenterShell>
  );
}
