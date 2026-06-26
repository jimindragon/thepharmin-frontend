"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import {
  billingRecords,
  boostTrackLabel,
  calcCompletedTotal,
  filterBillingRecords,
  paymentStatusClass,
  paymentStatusLabel,
  type BillingPeriod,
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

export function BusinessBillingHistoryClient() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [period, setPeriod] = useState<BillingPeriod>("3months");

  const filtered = filterBillingRecords(billingRecords, period, statusFilter);
  const completedTotal = calcCompletedTotal(filtered);
  const hasRecords = filtered.length > 0;

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
          <div className="flex">
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

          {/* 기간 필터 */}
          <div className="flex">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={clsx(
                  "h-10 border-y border-r px-4 text-[13px] transition first:border-l",
                  period === opt.id
                    ? "border-[#cfd8e3] font-bold text-[#111111]"
                    : "border-[#cfd8e3] font-medium text-[#8a94a3] hover:text-[#111111]",
                )}
                aria-pressed={period === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="mt-3 border border-[#dfe4ea] bg-white">
          {hasRecords ? (
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-[100px_minmax(0,1fr)_90px_110px_80px_170px] gap-4 border-b border-[#e5e9ef] px-5 py-3 text-[12px] font-medium text-[#8a94a3]">
                  <span>결제일</span>
                  <span>상품 / 공고</span>
                  <span>결제수단</span>
                  <span>금액</span>
                  <span>상태</span>
                  <span>증빙</span>
                </div>

                {/* 테이블 행 */}
                <div className="divide-y divide-[#e5e9ef]">
                  {filtered.map((record) => {
                    const isCancelled = record.status === "cancelled";
                    return (
                      <div
                        key={record.id}
                        className="grid grid-cols-[100px_minmax(0,1fr)_90px_110px_80px_170px] items-center gap-4 px-5 py-4"
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
                        <span className="text-[13px] font-semibold text-[#17202c]">{formatKrw(record.amountKrw)}</span>

                        {/* 상태 뱃지 */}
                        <span
                          className={clsx(
                            "inline-flex h-7 w-fit items-center justify-center border px-2 text-[11px] font-medium",
                            paymentStatusClass(record.status),
                          )}
                        >
                          {paymentStatusLabel(record.status)}
                        </span>

                        {/* 증빙 버튼 */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isCancelled}
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
                <div className="border-t border-[#e5e9ef] px-5 py-4 text-right">
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
              "표시 금액은 VAT 별도입니다. 세금계산서는 결제완료 건에 한해 발행할 수 있습니다.",
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
    </BusinessCenterShell>
  );
}
