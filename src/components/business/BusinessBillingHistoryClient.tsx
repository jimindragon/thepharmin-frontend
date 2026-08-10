"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { PageTitle } from "@/components/ui/Typography";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BillingDocumentModal } from "@/components/business/BillingDocumentModal";
import { DataTable, type DataTableColumn } from "@/components/business/table/DataTable";
import { TrackBadge } from "@/components/business/table/TrackBadge";
import { STATUS_TONE } from "@/config/statusTone";
import {
  billingRecords,
  boostTrackLabel,
  calcCompletedTotal,
  filterBillingRecords,
  PAYMENT_TONE,
  paymentStatusLabel,
  type BillingPeriod,
  type BillingRecord,
  type PaymentStatusFilter,
} from "@/data/businessBilling";

const STATUS_TABS: Array<{ id: PaymentStatusFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "completed", label: "결제완료" },
  { id: "cancelled", label: "결제취소" },
];

const PERIOD_OPTIONS: Array<{ id: BillingPeriod; label: string }> = [
  { id: "1month", label: "1개월" },
  { id: "3months", label: "3개월" },
  { id: "6months", label: "6개월" },
  { id: "1year", label: "1년" },
];

function formatKrw(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

/** 공급가액(VAT 별도) → 총 결제액(VAT 포함) */
function toTotalKrw(supplyKrw: number): number {
  return Math.round(supplyKrw * 1.1);
}

export function BusinessBillingHistoryClient() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [period, setPeriod] = useState<BillingPeriod>("3months");
  const [docModal, setDocModal] = useState<{ variant: "receipt" | "taxInvoice"; record: BillingRecord } | null>(null);

  const filtered = filterBillingRecords(billingRecords, period, statusFilter);
  const completedSupplyTotal = calcCompletedTotal(filtered);
  const completedTotal = toTotalKrw(completedSupplyTotal);
  const hasRecords = filtered.length > 0;

  const periodScoped = filterBillingRecords(billingRecords, period, "all");
  const tabCounts: Record<PaymentStatusFilter, number> = {
    all: periodScoped.length,
    completed: periodScoped.filter((r) => r.status === "completed").length,
    cancelled: periodScoped.filter((r) => r.status === "cancelled").length,
  };

  const BILLING_COLUMNS: DataTableColumn<BillingRecord>[] = [
    {
      key: "paidAt",
      header: "결제일",
      width: "100px",
      cell: (record) => (
        <span className="text-[13px] font-normal text-[#8a94a3]">{record.paidAt}</span>
      ),
    },
    {
      key: "product",
      header: "공고 / 상품",
      width: "minmax(0,1fr)",
      // 상품명은 "부스트 N주" 3종뿐이라, 행을 식별하는 공고명을 위에 둔다.
      // 트랙 배지는 아랫줄에 붙여 윗줄이 공고명 한 줄을 온전히 쓰게 한다.
      cell: (record) => (
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-[#17202c]">{record.jobTitle}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-normal text-[#596373]">{record.productName}</span>
            {/* 이 표에서만 배지가 행 높이에 닿는다(둘째 줄이 배지라 h-6이면 행이 84.4px).
                h-5에서는 상품명 텍스트 라인(13px×1.65 = 21.45px)이 바닥이라 행 81.8px */}
            <TrackBadge label={boostTrackLabel(record.track)} />
          </div>
        </div>
      ),
    },
    {
      key: "method",
      header: "결제수단",
      width: "90px",
      cell: (record) => (
        <span className="text-[13px] font-normal text-[#596373]">{record.paymentMethod}</span>
      ),
    },
    {
      key: "amount",
      header: "금액",
      width: "200px",
      cell: (record) => (
        <div>
          {/* 취소 건은 취소선으로만 구분한다 — 색은 주요값 잉크 유지.
              빨강은 "결과가 부정"(불합격)에만 남긴다 */}
          <p
            className={clsx(
              "text-[14px] font-semibold text-[#303946]",
              record.status === "cancelled" && "line-through",
            )}
          >
            {formatKrw(toTotalKrw(record.amountKrw))}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[12px] font-normal text-[#8a94a3]">
            공급가액 {formatKrw(record.amountKrw)} · VAT{" "}
            {formatKrw(toTotalKrw(record.amountKrw) - record.amountKrw)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: "80px",
      // 이 표는 점을 렌더하지 않아 StatusPill 대신 tone의 text만 쓴다
      cell: (record) => (
        <span
          className={clsx(
            "inline-flex w-fit items-center text-[13px] font-medium",
            STATUS_TONE[PAYMENT_TONE[record.status]].text,
          )}
        >
          {paymentStatusLabel(record.status)}
        </span>
      ),
    },
    {
      key: "documents",
      width: "170px",
      align: "end",
      cell: (record) => renderDocumentActions(record),
    },
  ];

  /**
   * 증빙 발급 버튼(세금계산서·영수증). 표의 액션 열과 모바일 카드가 같은 것을 쓴다 —
   * 결제취소 건의 세금계산서 비활성 규칙이 두 곳에서 갈리지 않게 한다.
   */
  function renderDocumentActions(record: BillingRecord) {
    const isCancelled = record.status === "cancelled";
    return (
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isCancelled}
          onClick={() => setDocModal({ variant: "taxInvoice", record })}
          className={clsx(
            "inline-flex h-8 items-center justify-center border px-3 text-[13px] font-medium transition",
            isCancelled
              ? "cursor-not-allowed border-[#e5e9ef] text-[#c0c8d2]"
              : "border-[#cfd8e3] text-[#303946] hover:border-[#111111] hover:text-[#111111]",
          )}
        >
          세금계산서
        </button>
        <button
          type="button"
          onClick={() => setDocModal({ variant: "receipt", record })}
          className="inline-flex h-8 items-center justify-center border border-[#cfd8e3] px-3 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
        >
          영수증
        </button>
      </span>
    );
  }

  /**
   * ≤760px 카드 한 장. 표 6열(결제일·공고/상품·결제수단·금액·상태·증빙)을 네 줄로 접는다.
   *
   * 1줄: 공고명 + 결제 상태. 이 표의 상태는 점 없는 텍스트라 뱃지 대신 tone의 색만 쓴다
   *      (표의 상태 열과 같은 마크업).
   * 2줄: 트랙 배지 + 상품명 · 결제일 · 결제수단.
   * 3줄: 금액. 총액과 "공급가액 · VAT" 보조줄을 표의 금액 셀 그대로 둔다 — 증빙을 받는
   *      화면이라 세액 분해가 곧 이 표의 값이다. 취소 건 취소선도 그대로다.
   * 4줄: 증빙 버튼. 금액과 한 줄에 합치면 342px에서 보조줄(175px)과 버튼(166px)이 부딪힌다.
   *
   * 행 전체 탭·chevron은 없다 — 결제 건 상세 화면이 없고, 이 행의 목적지는 두 증빙 모달뿐이라
   * 어느 하나를 행 전체에 걸 수 없다(파일럿 원칙: 목적지 없는 chevron 금지).
   */
  const renderMobileCard = (record: BillingRecord) => (
    <div className="px-6 py-4">
      <div className="flex items-start gap-3">
        <p className="line-clamp-1 min-w-0 flex-1 text-[15px] font-semibold leading-[1.45] text-[#17202c]">
          {record.jobTitle}
        </p>
        <span
          className={clsx(
            "shrink-0 text-[13px] font-medium",
            STATUS_TONE[PAYMENT_TONE[record.status]].text,
          )}
        >
          {paymentStatusLabel(record.status)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] font-normal text-[#8a94a3]">
        <TrackBadge label={boostTrackLabel(record.track)} />
        <span>{record.productName}</span>
        <span aria-hidden>·</span>
        <span className="whitespace-nowrap">결제 {record.paidAt}</span>
        <span aria-hidden>·</span>
        <span>{record.paymentMethod}</span>
      </div>

      <div className="mt-2.5">
        <p
          className={clsx(
            "text-[15px] font-semibold text-[#303946]",
            record.status === "cancelled" && "line-through",
          )}
        >
          {formatKrw(toTotalKrw(record.amountKrw))}
        </p>
        <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">
          공급가액 {formatKrw(record.amountKrw)} · VAT{" "}
          {formatKrw(toTotalKrw(record.amountKrw) - record.amountKrw)}
        </p>
      </div>

      <div className="mt-3 flex justify-end">{renderDocumentActions(record)}</div>
    </div>
  );

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div>
          <PageBreadcrumb
            items={[
              { label: "기업센터", href: "/business/dashboard" },
              { label: "요금제/결제" },
              { label: "결제 내역" },
            ]}
          />
          <PageTitle className="max-[760px]:mt-0">결제 내역</PageTitle>
          <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            부스트 결제 내역을 조회하고, 세금계산서와 영수증을 발급받을 수 있습니다.
          </p>
        </div>

        {/* 필터 바 */}
        <div className="mt-6 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
          {/* 상태 탭 */}
          <div className="flex items-center overflow-x-auto border-b border-border">
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

          {/* 기간 필터 */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as BillingPeriod)}
              className="h-10 appearance-none border border-[#cfd8e3] bg-white pl-3 pr-8 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111]"
            >
              {PERIOD_OPTIONS.map((opt) => (
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
        </div>

        {/* 테이블 영역 — ≤760px는 카드. 셸 거터(24px)를 되밀어 화면 폭을 채운다(공고 관리 선례) */}
        <div className="max-[760px]:-mx-[calc(var(--shell-gutter)/2)]">
          <DataTable
            columns={BILLING_COLUMNS}
            rows={filtered}
            rowKey={(record) => record.id}
            mobileCard={renderMobileCard}
            /* A계열의 기존 min-w는 이미 패딩 포함 총폭이었다 — 48을 더하지 않는다 */
            minWidth={950}
            empty={{
              title: "결제 내역이 없습니다",
              description: "부스트를 이용하면 결제 내역이 이곳에 표시됩니다.",
            }}
            footer={
              hasRecords ? (
                // ≤760px 패딩은 카드와 같은 24px로 맞춘다 — 카드 목록이 화면 폭을 꽉 채우면서
                // 합계 줄만 16px로 들어와 있으면 오른쪽 끝이 카드 값들과 어긋난다.
                <div className="border-t border-border px-6 py-4 text-right">
                  <span className="text-[13px] font-normal text-[#8a94a3]">
                    조회 기간 결제 합계 (결제완료 기준)
                  </span>
                  <span className="ml-4 text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">
                    {formatKrw(completedTotal)}
                  </span>
                </div>
              ) : undefined
            }
          />
        </div>

        {/* 안내 박스 */}
        <div className="mt-4 border border-[#dfe4ea] bg-[#f7f8fa] px-5 py-4">
          <p className="text-[13px] font-semibold text-[#303946]">안내</p>
          <ul className="mt-2 space-y-1.5">
            {[
              "표시 금액은 VAT 포함 결제액입니다. 세금계산서는 결제완료 건에 한해 발행할 수 있습니다.",
              "결제취소 건은 세금계산서가 발행되지 않으며, 환불 정책은 상품 이용 안내를 따릅니다.",
            ].map((text) => (
              <li key={text} className="flex gap-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">
                <span className="shrink-0">·</span>
                <span>{text}</span>
              </li>
            ))}
            <li className="flex gap-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">
              <span className="shrink-0">·</span>
              <span>
                세금계산서 발행 정보는{" "}
                <Link
                  href="/business/company/profile"
                  className="font-medium text-[#303946] underline underline-offset-2 hover:text-[#111111]"
                >
                  기업정보 관리
                </Link>
                에서 수정할 수 있습니다.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <BillingDocumentModal
        open={docModal !== null}
        variant={docModal?.variant ?? "receipt"}
        record={docModal?.record ?? null}
        onClose={() => setDocModal(null)}
      />
    </BusinessCenterShell>
  );
}
