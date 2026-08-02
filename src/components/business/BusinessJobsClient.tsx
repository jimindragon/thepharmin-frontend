"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BoostModal } from "@/components/business/BoostModal";
import { DataTable, type DataTableColumn } from "@/components/business/table/DataTable";
import { StatusPill } from "@/components/business/table/StatusPill";
import { TrackBadge } from "@/components/business/table/TrackBadge";
import {
  filterJobPostings,
  getClosingDday,
  JOB_POSTING_TONE,
  jobPostings,
  jobTrackLabel,
  type JobPosting,
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

  const tabCounts: Record<JobPostingStatusFilter, number> = {
    all: jobPostings.length,
    pending: jobPostings.filter((p) => p.status === "pending").length,
    active: jobPostings.filter((p) => p.status === "active").length,
    closed: jobPostings.filter((p) => p.status === "closed").length,
  };

  const JOB_COLUMNS: DataTableColumn<JobPosting>[] = [
    {
      key: "title",
      header: "공고",
      width: "minmax(0,1fr)",
      cell: (posting) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <p
            className={clsx(
              "text-[16px] font-semibold",
              posting.status === "closed" ? "text-[#8a94a3]" : "text-[#17202c]",
            )}
          >
            {posting.title}
          </p>
          <TrackBadge label={jobTrackLabel(posting.track)} />
        </div>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: "80px",
      // 검토 대기(운영팀 심사 중)와 게시 중은 둘 다 "프로세스가 도는" 상태라 같은 progress를 쓴다.
      // 이 표에는 결과 상태가 없어 초록이 나오지 않는다.
      cell: (posting) => (
        <StatusPill
          tone={JOB_POSTING_TONE[posting.status]}
          label={
            posting.status === "closed"
              ? "마감"
              : posting.status === "pending"
                ? "검토 대기"
                : "게시 중"
          }
        />
      ),
    },
    {
      key: "applicants",
      header: "지원자",
      width: "80px",
      cell: (posting) =>
        posting.status === "pending" ? (
          <span className="text-[13px] text-[#8a94a3]">—</span>
        ) : (
          <span
            className={clsx(
              "text-[14px] font-semibold",
              posting.status === "closed" ? "text-[#8a94a3]" : "text-[#303946]",
            )}
          >
            {posting.applicantCount}명
          </span>
        ),
    },
    {
      key: "registeredAt",
      header: "등록일",
      width: "90px",
      cell: (posting) => (
        <span className="text-[13px] font-normal text-[#8a94a3]">{posting.registeredAt}</span>
      ),
    },
    {
      key: "closingDate",
      header: "마감일",
      width: "130px",
      cell: (posting) => {
        const dday =
          posting.status === "active" && posting.closingDate
            ? getClosingDday(posting.closingDate)
            : null;
        return (
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
        );
      },
    },
    {
      key: "action",
      width: "120px",
      align: "end",
      // w-[108px] 고정 — 세 상태(연장 disabled / 연장 / 부스트)가 같은 자리를 차지해야 한다
      cell: (posting) => {
        const isClosed = posting.status === "closed";
        const isPending = posting.status === "pending";
        if (isClosed || isPending) {
          return (
            <button
              type="button"
              disabled
              title={EXTEND_DISABLED_TITLE}
              aria-label={EXTEND_DISABLED_TITLE}
              className="inline-flex h-8 w-[108px] cursor-not-allowed items-center justify-center border border-[#e5e9ef] px-4 text-[13px] font-medium text-[#c0c8d2]"
            >
              연장
            </button>
          );
        }
        return posting.boost ? (
          <Link
            href="/business/billing/plans"
            className="inline-flex h-8 w-[108px] items-center justify-center border border-[#cfd8e3] px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
          >
            연장
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setBoostModalJobId(posting.id)}
            className="inline-flex h-8 w-[108px] items-center justify-center gap-1 border border-[#111111] bg-[#111111] px-4 text-[13px] font-semibold text-white transition hover:border-[#303946] hover:bg-[#303946]"
          >
            <span>↑</span>
            <span>부스트</span>
          </button>
        );
      },
    },
  ];

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
        <DataTable
          columns={JOB_COLUMNS}
          rows={filtered}
          rowKey={(posting) => posting.id}
          /* A계열의 기존 min-w는 이미 패딩 포함 총폭이었다(패딩이 행 안에 있었으므로) —
             B계열처럼 48을 더하면 안 된다 */
          minWidth={940}
          empty={{
            title:
              statusFilter === "active"
                ? "게시 중인 공고가 없습니다"
                : statusFilter === "closed"
                  ? "마감된 공고가 없습니다"
                  : "등록된 공고가 없습니다",
            description:
              statusFilter === "all"
                ? "공고를 등록하면 여기서 관리할 수 있습니다."
                : "조건에 해당하는 공고가 없습니다.",
            action:
              statusFilter === "all" ? (
                <Link
                  href="/business/jobs/new"
                  className="mt-6 inline-flex h-10 items-center justify-center border border-[#111111] bg-[#111111] px-6 text-[13px] font-semibold text-white transition hover:bg-[#303946]"
                >
                  공고 등록하기
                </Link>
              ) : undefined,
          }}
        />
      </div>

      <BoostModal
        open={boostModalJobId !== null}
        onClose={() => setBoostModalJobId(null)}
        preselectedJobId={boostModalJobId}
      />
    </BusinessCenterShell>
  );
}
