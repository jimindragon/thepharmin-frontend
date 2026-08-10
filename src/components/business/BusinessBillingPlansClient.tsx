"use client";

import clsx from "clsx";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { typeScale } from "@/components/ui/Typography";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BusinessStatCard, BusinessStatGrid } from "@/components/business/BusinessStatCard";
import { BoostModal } from "@/components/business/BoostModal";
import { DataTable, type DataTableColumn } from "@/components/business/table/DataTable";
import { TrackBadge } from "@/components/business/table/TrackBadge";
import { STATUS_TONE } from "@/config/statusTone";
import {
  activeBoosts,
  billingRecords,
  billingStats,
  BOOST_TONE,
  boostStatusLabel,
  boostTrackLabel,
  type ActiveBoost,
} from "@/data/businessBilling";
import { BOOST_GRADE_LABEL, type BoostGrade } from "@/data/boostPricing";
import { MOCK_TODAY_DATE } from "@/config/mockToday";

function formatKrw(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

/** 공고 관리의 마감 행과 같은 문구 — 종료된 부스트는 연장할 수 없다 */
const EXTEND_DISABLED_TITLE = "진행 중인 부스트만 연장할 수 있습니다.";

// ── 통계 카드 보조 문구용 파생 값 ────────────────────────────────────────────

const urgentBoosts = activeBoosts.filter((b) => b.status === "ending_soon");
const mostUrgentDays = urgentBoosts.length > 0
  ? Math.min(...urgentBoosts.map((b) => b.daysLeft))
  : null;

const thisYM = (() => {
  const d = MOCK_TODAY_DATE;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
})();
const monthlyPaymentCount = billingRecords.filter(
  (r) => r.paidAt.startsWith(thisYM) && r.status === "completed",
).length;

const latestAppliedAt = billingRecords
  .filter((r) => r.status === "completed")
  .map((r) => r.paidAt)
  .sort()
  .at(-1) ?? null;

export function BusinessBillingPlansClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const [extendTarget, setExtendTarget] = useState<{ jobId: string; grade: BoostGrade } | null>(null);
  const stats = billingStats;
  const boosts = activeBoosts;
  const hasBoosts = boosts.length > 0;

  const BOOST_COLUMNS: DataTableColumn<ActiveBoost>[] = [
    {
      key: "job",
      header: "공고",
      width: "minmax(0,1fr)",
      cell: (boost) => (
        // 종료된 부스트는 공고 관리의 "마감" 행과 같은 방식으로 제목·주요값을 흐린다
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={clsx(
              "text-[16px] font-semibold",
              boost.status === "ended" ? "text-[#8a94a3]" : "text-[#17202c]",
            )}
          >
            {boost.jobTitle}
          </span>
          <TrackBadge label={boostTrackLabel(boost.track)} />
        </div>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: "95px",
      cell: (boost) => (
        // 이 표는 점을 렌더하지 않아 StatusPill 대신 tone의 text만 쓴다.
        // 굵기는 여기서 정한다 — 색 매핑은 색만 든다.
        <span className={clsx("text-[13px] font-medium", STATUS_TONE[BOOST_TONE[boost.status]].text)}>
          {boostStatusLabel(boost.status, boost.daysLeft)}
        </span>
      ),
    },
    {
      key: "period",
      header: "기간",
      width: "195px",
      cell: (boost) => (
        <span className="whitespace-nowrap text-[13px] font-normal text-[#596373]">
          {BOOST_GRADE_LABEL[boost.grade]} · {boost.durationWeeks}주 · ~{boost.endDate}
        </span>
      ),
    },
    {
      key: "amount",
      header: "결제 금액",
      width: "90px",
      cell: (boost) => (
        <span
          className={clsx(
            "text-[14px] font-semibold",
            boost.status === "ended" ? "text-[#8a94a3]" : "text-[#303946]",
          )}
        >
          {formatKrw(boost.amountKrw)}
        </span>
      ),
    },
    {
      key: "action",
      width: "72px",
      align: "end",
      cell: (boost) => renderExtendAction(boost),
    },
  ];

  /** 연장 버튼. 표의 액션 열과 모바일 카드가 같은 것을 쓴다 — 종료 건 비활성 규칙이 갈리지 않게 한다. */
  function renderExtendAction(boost: ActiveBoost) {
    const isEnded = boost.status === "ended";
    return (
      <button
        type="button"
        disabled={isEnded}
        title={isEnded ? EXTEND_DISABLED_TITLE : undefined}
        aria-label={isEnded ? EXTEND_DISABLED_TITLE : undefined}
        onClick={() => openExtendModal(boost.jobId, boost.grade)}
        className={clsx(
          "inline-flex h-8 items-center justify-center border px-3 text-[13px] font-medium transition",
          isEnded
            ? "cursor-not-allowed border-[#e5e9ef] text-[#c0c8d2]"
            : "border-[#cfd8e3] text-[#303946] hover:border-[#111111] hover:text-[#111111]",
        )}
      >
        연장
      </button>
    );
  }

  /**
   * ≤760px 카드 한 장. 표 5열(공고·상태·기간·결제 금액·액션)을 세 줄로 접는다.
   *
   * 1줄: 공고명 + 상태("D-N 종료 임박" 등). 이 표도 점 없는 텍스트 상태라 표의 상태 열과
   *      같은 마크업을 쓴다 — 종료 임박 D-day가 카드 첫 줄에서 바로 읽히는 것이 요점이다.
   * 2줄: 트랙 배지 + 등급 · 기간 · 종료일 · 결제 금액
   * 3줄: 연장(종료 건은 비활성)
   *
   * chevron 없음 — 부스트 건 상세 화면이 없고 이 행의 동작은 연장 모달 하나뿐이다.
   */
  const renderMobileCard = (boost: ActiveBoost) => {
    const isEnded = boost.status === "ended";
    return (
      <div className="px-6 py-4">
        <div className="flex items-start gap-3">
          <p
            className={clsx(
              "line-clamp-1 min-w-0 flex-1 text-[15px] font-semibold leading-[1.45]",
              isEnded ? "text-[#8a94a3]" : "text-[#17202c]",
            )}
          >
            {boost.jobTitle}
          </p>
          <span
            className={clsx(
              "shrink-0 whitespace-nowrap text-[13px] font-medium",
              STATUS_TONE[BOOST_TONE[boost.status]].text,
            )}
          >
            {boostStatusLabel(boost.status, boost.daysLeft)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] font-normal text-[#8a94a3]">
          <TrackBadge label={boostTrackLabel(boost.track)} />
          <span className="whitespace-nowrap">
            {BOOST_GRADE_LABEL[boost.grade]} · {boost.durationWeeks}주 · ~{boost.endDate}
          </span>
          <span aria-hidden>·</span>
          <span
            className={clsx(
              "font-semibold",
              isEnded ? "text-[#8a94a3]" : "text-[#303946]",
            )}
          >
            {formatKrw(boost.amountKrw)}
          </span>
        </div>

        <div className="mt-3 flex justify-end">{renderExtendAction(boost)}</div>
      </div>
    );
  };

  function openNewBoostModal() {
    setExtendTarget(null);
    setModalOpen(true);
  }

  function openExtendModal(jobId: string, grade: BoostGrade) {
    setExtendTarget({ jobId, grade });
    setModalOpen(true);
  }

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "요금제/결제" },
              { label: "요금제 관리" },
            ]}
          />
          {/* mt-5는 이 줄이 소유한다(h1이 아니라 제목+버튼 행이라) — ≤760px에서는 셸 pt-8이
              여백을 대신 잡으므로 0으로 접는다. 다른 기업센터 페이지의 PageTitle과 같은 규칙. */}
          <div className="mt-5 flex items-center justify-between gap-5 max-[760px]:mt-0 max-[760px]:flex-col max-[760px]:items-start">
            <h1 className={clsx(typeScale.pageTitle, "text-[#242b36]")}>요금제 관리</h1>
            <button
              type="button"
              onClick={openNewBoostModal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] max-[760px]:w-full"
            >
              <Plus size={15} />
              새 부스트 적용하기
            </button>
          </div>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            진행 중인 부스트를 확인하고, 새 부스트를 적용하거나 연장할 수 있습니다.
          </p>
        </div>

        {/* 통계 3분할 */}
        <BusinessStatGrid cols={3}>
          <BusinessStatCard
            label="진행 중인 부스트"
            value={String(stats.activeBoostCount)}
            unit="건"
            subEmphasis={mostUrgentDays !== null ? `D-${mostUrgentDays} 종료 임박 ${urgentBoosts.length}건` : undefined}
            emphasisVariant={mostUrgentDays !== null ? "urgent" : "neutral"}
            sub={mostUrgentDays === null ? "종료 임박 없음" : undefined}
          />
          <BusinessStatCard
            label="이번 달 부스트 결제"
            value={hasBoosts ? stats.monthlyPaymentKrw.toLocaleString("ko-KR") : "0"}
            unit="원"
            sub={`이번 달 결제 ${monthlyPaymentCount}건`}
          />
          <BusinessStatCard
            label="누적 부스트"
            value={String(stats.cumulativeBoostCount)}
            unit="건"
            sub={latestAppliedAt ? `최근 적용 ${latestAppliedAt}` : undefined}
          />
        </BusinessStatGrid>

        {/* 진행 중인 부스트 */}
        <h2 className="mt-6 text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]">
          진행 중인 부스트
        </h2>
        {/* ≤760px는 카드. 셸 거터(24px)를 되밀어 화면 폭을 채운다(공고 관리 선례) */}
        <div className="max-[760px]:-mx-[calc(var(--shell-gutter)/2)]">
          <DataTable
            columns={BOOST_COLUMNS}
            rows={boosts}
            rowKey={(boost) => boost.id}
            mobileCard={renderMobileCard}
            /* 740(기존 트랙 폭) + 좌우 패딩 48 */
            minWidth={788}
            empty={{
              title: "아직 진행 중인 부스트가 없습니다",
              description:
                "부스트는 공고를 목록 상단에 노출하고 관련 인재에게 알림을 보내는 기능입니다.",
              action: (
                <Link
                  href="/business#pricing"
                  className="mt-6 inline-flex h-10 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a]"
                >
                  요금제 알아보기
                </Link>
              ),
            }}
          />
        </div>

        {/* 하단 안내 배너 */}
        <div className="mt-5 flex items-center justify-between gap-4 border border-border bg-white px-6 py-5 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <p className="text-[14px] font-bold text-[#17202c]">부스트가 처음이신가요?</p>
            <p className="mt-1 text-[13px] font-normal text-[#68717e]">
              부스트의 노출 효과와 기간별 요금을 요금제 안내에서 확인할 수 있습니다.
            </p>
          </div>
          <Link
            href="/business#pricing"
            className="shrink-0 text-[13px] font-medium text-[#303946] transition hover:text-[#111111] hover:underline"
          >
            요금제 안내 보기 →
          </Link>
        </div>
      </div>

      <BoostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedJobId={null}
        initialJobId={extendTarget?.jobId}
        initialGrade={extendTarget?.grade}
      />
    </BusinessCenterShell>
  );
}
