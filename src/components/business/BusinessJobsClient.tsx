"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BoostModal } from "@/components/business/BoostModal";
import {
  filterJobPostings,
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

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "채용 관리" },
              { label: "공고 관리" },
            ]}
          />
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">공고 관리</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">
            등록한 공고를 관리하고, 공고별로 부스트를 적용할 수 있습니다.
          </p>
        </div>

        {/* 상태 탭 */}
        <div className="mt-6 flex">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={clsx(
                "h-10 border-y border-r px-4 text-[13px] font-medium transition first:border-l",
                statusFilter === tab.id
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#cfd8e3] bg-white text-[#4f5967] hover:border-[#111111] hover:text-[#111111]",
              )}
              aria-pressed={statusFilter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        <div className="mt-3 border border-[#dfe4ea] bg-white">
          {hasJobs ? (
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[minmax(0,1fr)_80px_80px_80px_130px] gap-4 border-b border-[#e5e9ef] px-5 py-3 text-[12px] font-medium text-[#8a94a3]">
                  <span>공고</span>
                  <span>상태</span>
                  <span>지원자</span>
                  <span>부스트</span>
                  <span></span>
                </div>

                {/* 테이블 행 */}
                <div className="divide-y divide-[#e5e9ef]">
                  {filtered.map((posting) => {
                    const isClosed = posting.status === "closed";
                    const isPending = posting.status === "pending";
                    const { boost } = posting;

                    return (
                      <div
                        key={posting.id}
                        className="grid grid-cols-[minmax(0,1fr)_80px_80px_80px_130px] items-center gap-4 px-5 py-4"
                      >
                        {/* 공고 */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p
                              className={clsx(
                                "text-[13px] font-semibold",
                                isClosed ? "text-[#8a94a3]" : "text-[#17202c]",
                              )}
                            >
                              {posting.title}
                            </p>
                            <span className="inline-flex h-5 items-center border border-[#d8e0e8] px-1.5 text-[11px] font-medium text-[#596373]">
                              {jobTrackLabel(posting.track)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">
                            {posting.registeredAt} 등록 ·{" "}
                            {posting.closingDate ? `${posting.closingDate} 마감` : "마감됨"}
                          </p>
                        </div>

                        {/* 상태 */}
                        <span
                          className={clsx(
                            "inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium",
                            isClosed
                              ? "border-[#d8dee7] bg-[#f7f8fa] text-[#8a94a3]"
                              : isPending
                                ? "border-status-warning-border bg-status-warning-subtle text-status-warning"
                                : "border-status-positive-border bg-status-positive-subtle text-status-positive",
                          )}
                        >
                          {isClosed ? "마감" : isPending ? "검토 대기" : "게시 중"}
                        </span>

                        {/* 지원자 */}
                        {isPending ? (
                          <span className="text-[13px] text-[#8a94a3]">—</span>
                        ) : (
                          <span
                            className={clsx(
                              "text-[13px] font-semibold",
                              isClosed ? "text-[#8a94a3]" : "text-[#17202c]",
                            )}
                          >
                            {posting.applicantCount}명
                          </span>
                        )}

                        {/* 부스트 */}
                        {boost ? (
                          <span
                            className={clsx(
                              "text-[13px] font-semibold",
                              boost.isUrgent ? "text-status-urgent" : "text-status-positive",
                            )}
                          >
                            D-{boost.daysLeft}
                          </span>
                        ) : (
                          <span className="text-[13px] text-[#8a94a3]">—</span>
                        )}

                        {/* 액션 */}
                        <div className="flex justify-end">
                          {isClosed || isPending ? (
                            <button
                              type="button"
                              disabled
                              title={EXTEND_DISABLED_TITLE}
                              aria-label={EXTEND_DISABLED_TITLE}
                              className="inline-flex h-9 cursor-not-allowed items-center justify-center border border-[#e5e9ef] px-4 text-[13px] font-medium text-[#c0c8d2]"
                            >
                              연장
                            </button>
                          ) : boost ? (
                            <Link
                              href="/business/billing/plans"
                              className="inline-flex h-9 items-center justify-center border border-[#cfd8e3] px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                            >
                              연장
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBoostModalJobId(posting.id)}
                              className="inline-flex h-9 items-center justify-center gap-1 border border-[#111111] bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:border-[#303946] hover:bg-[#303946]"
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
              <p className="text-[15px] font-medium text-[#17202c]">
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
