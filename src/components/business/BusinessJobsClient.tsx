"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PageTitle } from "@/components/ui/Typography";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BoostModal } from "@/components/business/BoostModal";
import { DataTable, type DataTableColumn } from "@/components/business/table/DataTable";
import { StatusPill } from "@/components/business/table/StatusPill";
import { TrackBadge } from "@/components/business/table/TrackBadge";
import { PageTabBar } from "@/components/ui/PageTabBar";
import {
  filterJobPostings,
  getClosingDday,
  JOB_POSTING_TONE,
  jobPostings,
  jobTrackLabel,
  type JobPosting,
  type JobPostingStatus,
  type JobPostingStatusFilter,
} from "@/data/businessJobs";

const STATUS_TABS: Array<{ id: JobPostingStatusFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "pending", label: "검토 대기" },
  { id: "active", label: "게시 중" },
  { id: "closed", label: "마감" },
];

const EXTEND_DISABLED_TITLE = "게시 중인 공고만 연장할 수 있습니다.";

/** 상태 라벨. 표의 상태 열과 모바일 카드의 상태 뱃지가 같은 말을 쓰도록 한 곳에서 만든다. */
function jobStatusLabel(status: JobPostingStatus): string {
  return status === "closed" ? "마감" : status === "pending" ? "검토 대기" : "게시 중";
}

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

  /**
   * 관리 동작(연장 disabled / 연장 / 부스트). 표의 액션 열과 모바일 카드가 같은 것을 쓴다.
   *
   * 카드에서 생략하지 않은 이유: 이 표에는 "공고 상세" 목적지가 없어(기업센터 공고 라우트는
   * 목록과 /new뿐) 행을 탭해 보낼 곳도, 생략한 동작을 대신 수행할 곳도 없다. 카드에서 빼면
   * 모바일에서는 부스트·연장을 아예 할 수 없게 된다.
   *
   * w-[108px] 고정은 표 사정(세 상태가 같은 자리를 차지해야 한다)이지만 카드에서도 그대로 둔다 —
   * 카드는 우측 정렬이라 폭이 고정이어야 상태가 섞인 목록에서 버튼 오른쪽 끝이 한 줄로 선다.
   */
  const renderAction = (posting: JobPosting) => {
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
          label={jobStatusLabel(posting.status)}
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
      cell: (posting) => renderAction(posting),
    },
  ];

  /**
   * ≤760px 카드 한 장. 표 6열(공고·상태·지원자·등록일·마감일·액션)을 세 줄로 접는다.
   *
   * 1줄: 제목 + 상태 — 진단의 핵심("분류 화면에서 상태 노출 0%")이 여기서 풀린다. 940px 표에서
   *      상태 열은 첫 화면에 아예 들어오지 않았다. 제목이 아무리 길어도 상태는 제자리를 지키도록
   *      제목만 line-clamp-1로 줄이고 상태는 shrink-0으로 고정한다.
   * 2줄: 트랙 배지 + 메타 점 구분. 좁은 폭에서 넘치면 wrap해 잘리지 않게 둔다 — 표에서
   *      가로 스크롤 뒤로 숨던 등록일·마감일이 카드에서는 전부 보이는 것이 요점이다.
   * 3줄: 관리 동작. 우측 정렬로 표의 액션 열 위치 감각을 유지한다.
   *
   * 행 전체 탭·chevron은 두지 않았다 — 보낼 상세 화면이 없다(renderAction 주석 참고).
   */
  const renderMobileCard = (posting: JobPosting) => {
    const isClosed = posting.status === "closed";
    const dday =
      posting.status === "active" && posting.closingDate
        ? getClosingDday(posting.closingDate)
        : null;

    return (
      <div className="px-6 py-4">
        <div className="flex items-start gap-3">
          <p
            className={clsx(
              "line-clamp-1 min-w-0 flex-1 text-[15px] font-semibold leading-[1.45]",
              isClosed ? "text-[#8a94a3]" : "text-[#17202c]",
            )}
          >
            {posting.title}
          </p>
          <span className="shrink-0">
            <StatusPill
              tone={JOB_POSTING_TONE[posting.status]}
              label={jobStatusLabel(posting.status)}
            />
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] font-normal text-[#8a94a3]">
          <TrackBadge label={jobTrackLabel(posting.track)} />
          <span>지원자 {posting.status === "pending" ? "—" : `${posting.applicantCount}명`}</span>
          <span aria-hidden>·</span>
          <span>등록 {posting.registeredAt}</span>
          <span aria-hidden>·</span>
          <span className="whitespace-nowrap">
            {posting.closingDate ? `마감 ${posting.closingDate}` : "마감됨"}
            {dday && (
              <span
                className={clsx(
                  "ml-1 font-semibold",
                  dday.isUrgent ? "text-status-urgent" : "text-status-positive",
                )}
              >
                D-{dday.daysLeft}
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 flex justify-end">{renderAction(posting)}</div>
      </div>
    );
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
          <PageTitle className="max-[760px]:mt-0">공고 관리</PageTitle>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            등록한 공고를 관리하고, 공고별로 부스트를 적용할 수 있습니다.
          </p>
        </div>

        {/* 상태 탭 — ≤760px는 탭바 페이지 공용 스킨(PageTabBar)으로 갈아탄다.
            밑줄 탭 행은 390px에서 마지막 "마감"이 50px 잘려 나갔다. 4탭이라 균등 grid-cols-4가
            정확히 맞고, 데스크톱 모습은 종전 그대로 둔다(CategoryTabs page 변형과 같은 이중 렌더). */}
        <div className="mt-6 flex items-center overflow-x-auto border-b border-border max-[760px]:hidden">
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

        <PageTabBar
          className="mt-6 min-[761px]:hidden"
          ariaLabel="공고 상태"
          items={STATUS_TABS.map((tab) => ({
            ...tab,
            count: tabCounts[tab.id],
          }))}
          activeId={statusFilter}
          onSelect={setStatusFilter}
        />

        {/* 테이블 — ≤760px는 카드 목록. 셸 거터(24px)만큼 되밀어 화면 폭을 꽉 채운다.
            기업센터 본문이 ≤760px에서 px-0이라 상쇄할 것이 app-shell 거터 하나뿐이다
            (FLUSH_LIST_CLASS와 같은 계산). 761px 이상은 음수 마진이 걸리지 않아 표 그대로다. */}
        <div className="max-[760px]:-mx-[calc(var(--shell-gutter)/2)]">
          <DataTable
            columns={JOB_COLUMNS}
            rows={filtered}
            rowKey={(posting) => posting.id}
            mobileCard={renderMobileCard}
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
      </div>

      <BoostModal
        open={boostModalJobId !== null}
        onClose={() => setBoostModalJobId(null)}
        preselectedJobId={boostModalJobId}
      />
    </BusinessCenterShell>
  );
}
