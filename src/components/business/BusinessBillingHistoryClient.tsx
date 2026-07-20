"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { BillingDocumentModal } from "@/components/business/BillingDocumentModal";
import {
  billingRecords,
  boostTrackLabel,
  calcCompletedTotal,
  filterBillingRecords,
  paymentStatusClass,
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
          <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">결제 내역</h1>
          <p className="mt-2 text-[13px] font-normal text-[#68717e]">
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

        {/* 테이블 영역 */}
        <div className="mt-3 border border-border bg-white">
          {hasRecords ? (
            <div className="overflow-x-auto">
              <div className="min-w-[950px]">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[100px_minmax(0,1fr)_90px_200px_80px_170px] gap-4 border-b border-border px-5 py-3 text-[12px] font-medium text-[#8a94a3]">
                  <span>결제일</span>
                  <span>상품 / 공고</span>
                  <span>결제수단</span>
                  <span>금액</span>
                  <span>상태</span>
                  <span aria-hidden="true" />
                </div>

                {/* 테이블 행 */}
                <div className="divide-y divide-[#e5e9ef]">
                  {filtered.map((record) => {
                    const isCancelled = record.status === "cancelled";
                    return (
                      <div
                        key={record.id}
                        className="grid grid-cols-[100px_minmax(0,1fr)_90px_200px_80px_170px] items-center gap-4 px-5 py-4"
                      >
                        {/* 결제일 */}
                        <span className="text-[13px] font-normal text-[#8a94a3]">{record.paidAt}</span>

                        {/* 상품/공고 */}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#17202c]">{record.productName}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-normal text-[#596373]">{record.jobTitle}</span>
                            <span className="inline-flex h-5 items-center border border-[#d8e0e8] px-1.5 text-[11px] font-medium text-[#596373]">
                              {boostTrackLabel(record.track)}
                            </span>
                          </div>
                        </div>

                        {/* 결제수단 */}
                        <span className="text-[13px] font-normal text-[#596373]">{record.paymentMethod}</span>

                        {/* 금액 */}
                        <div>
                          <p className="text-[13px] font-semibold text-[#17202c]">
                            {formatKrw(toTotalKrw(record.amountKrw))}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap text-[11px] font-normal text-[#8a94a3]">
                            공급가액 {formatKrw(record.amountKrw)} · VAT {formatKrw(toTotalKrw(record.amountKrw) - record.amountKrw)}
                          </p>
                        </div>

                        {/* 상태 뱃지 */}
                        <span
                          className={clsx(
                            "inline-flex w-fit items-center text-[12px] font-medium",
                            paymentStatusClass(record.status),
                          )}
                        >
                          {paymentStatusLabel(record.status)}
                        </span>

                        {/* 증빙 버튼 */}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isCancelled}
                            onClick={() => setDocModal({ variant: "taxInvoice", record })}
                            className={clsx(
                              "inline-flex h-8 items-center justify-center border px-3 text-[12px] font-medium transition",
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
                            className="inline-flex h-8 items-center justify-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                          >
                            영수증
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 합계 행 */}
                <div className="border-t border-border px-5 py-4 text-right">
                  <span className="text-[13px] font-normal text-[#8a94a3]">
                    조회 기간 결제 합계 (결제완료 기준)
                  </span>
                  <span className="ml-4 text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">
                    {formatKrw(completedTotal)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* 빈 상태 */
            <div className="py-20 text-center">
              <p className="text-[15px] font-medium text-[#17202c]">결제 내역이 없습니다</p>
              <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
                부스트를 이용하면 결제 내역이 이곳에 표시됩니다.
              </p>
            </div>
          )}
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
