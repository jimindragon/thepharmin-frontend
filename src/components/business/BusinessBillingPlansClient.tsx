"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { SectionCard } from "@/components/business/BusinessFormControls";
import { BoostModal } from "@/components/business/BoostModal";
import {
  activeBoosts,
  billingStats,
  boostStatusClass,
  boostStatusLabel,
  boostTrackLabel,
} from "@/data/businessBilling";

function formatKrw(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

export function BusinessBillingPlansClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const stats = billingStats;
  const boosts = activeBoosts;
  const hasBoosts = boosts.length > 0;

  return (
    <BusinessCenterShell>
      <div>
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-5 max-[760px]:flex-col">
          <div>
            <PageBreadcrumb
              items={[
                { label: "기업센터", href: "/business/dashboard" },
                { label: "요금제/결제" },
                { label: "요금제 관리" },
              ]}
            />
            <h1 className="mt-5 text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">요금제 관리</h1>
            <p className="mt-2 text-[13px] font-normal text-[#68717e]">
              진행 중인 부스트를 확인하고, 새 부스트를 적용하거나 연장할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] max-[760px]:w-full"
          >
            <Plus size={15} />
            새 부스트 적용하기
          </button>
        </div>

        {/* 통계 3분할 */}
        <div className="mt-6 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1 max-[500px]:grid-cols-1">
          <div className="border border-[#dfe4ea] bg-white p-5">
            <p className="text-[12px] font-normal text-[#8a94a3]">진행 중인 부스트</p>
            <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#17202c]">
              {stats.activeBoostCount}
              <span className="ml-0.5 text-[18px] font-medium">건</span>
            </p>
          </div>
          <div className="border border-[#dfe4ea] bg-white p-5">
            <p className="text-[12px] font-normal text-[#8a94a3]">이번 달 부스트 결제</p>
            <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#17202c]">
              {hasBoosts ? stats.monthlyPaymentKrw.toLocaleString("ko-KR") : "0"}
              <span className="ml-0.5 text-[18px] font-medium">원</span>
            </p>
          </div>
          <div className="border border-[#dfe4ea] bg-white p-5">
            <p className="text-[12px] font-normal text-[#8a94a3]">누적 부스트</p>
            <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#17202c]">
              {stats.cumulativeBoostCount}
              <span className="ml-0.5 text-[18px] font-medium">건</span>
            </p>
          </div>
        </div>

        {/* 진행 중인 부스트 섹션 */}
        <div className="mt-5">
          <SectionCard title="진행 중인 부스트">
            {hasBoosts ? (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  {/* 테이블 헤더 */}
                  <div className="grid grid-cols-[minmax(0,1fr)_120px_160px_90px_auto] gap-4 border-b border-[#e5e9ef] pb-3 text-[12px] font-medium text-[#8a94a3]">
                    <span>공고</span>
                    <span>상태</span>
                    <span>기간</span>
                    <span>결제 금액</span>
                    <span />
                  </div>
                  {/* 테이블 행 */}
                  <div className="divide-y divide-[#e5e9ef]">
                    {boosts.map((boost) => (
                      <div
                        key={boost.id}
                        className="grid grid-cols-[minmax(0,1fr)_120px_160px_90px_auto] items-center gap-4 py-4 text-[13px]"
                      >
                        {/* 공고명 + 트랙 태그 */}
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="font-medium text-[#17202c]">{boost.jobTitle}</span>
                          <span className="inline-flex h-5 items-center border border-[#d8e0e8] px-1.5 text-[11px] font-medium text-[#596373]">
                            {boostTrackLabel(boost.track)}
                          </span>
                        </div>
                        {/* 상태 */}
                        <span className={`text-[13px] ${boostStatusClass(boost.status)}`}>
                          {boostStatusLabel(boost.status, boost.daysLeft)}
                        </span>
                        {/* 기간 */}
                        <span className="text-[13px] font-normal text-[#596373]">
                          {boost.durationWeeks}주 · ~{boost.endDate}
                        </span>
                        {/* 결제 금액 */}
                        <span className="text-[13px] font-medium text-[#17202c]">
                          {formatKrw(boost.amountKrw)}
                        </span>
                        {/* 액션 버튼 */}
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center border border-[#cfd8e3] px-3 text-[12px] font-medium text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
                        >
                          {boost.status === "ending_soon" ? "연장" : "상세"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 빈 상태 */
              <div className="py-16 text-center">
                <p className="text-[15px] font-medium text-[#17202c]">아직 진행 중인 부스트가 없습니다</p>
                <p className="mt-2 text-[13px] font-normal text-[#8a94a3]">
                  부스트는 공고를 목록 상단에 노출하고 관련 인재에게 알림을 보내는 기능입니다.
                </p>
                <Link
                  href="/business/pricing"
                  className="mt-6 inline-flex h-10 items-center border border-[#111111] bg-[#111111] px-5 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a]"
                >
                  요금제 알아보기
                </Link>
              </div>
            )}
          </SectionCard>
        </div>

        {/* 하단 안내 배너 */}
        <div className="mt-5 flex items-center justify-between gap-4 border border-[#dfe4ea] bg-white px-6 py-5 max-[760px]:flex-col max-[760px]:items-start">
          <div>
            <p className="text-[14px] font-bold text-[#17202c]">부스트가 처음이신가요?</p>
            <p className="mt-1 text-[13px] font-normal text-[#68717e]">
              부스트의 노출 효과와 기간별 요금을 요금제 안내에서 확인할 수 있습니다.
            </p>
          </div>
          <Link
            href="/business/pricing"
            className="shrink-0 text-[13px] font-medium text-[#00746C] transition hover:underline"
          >
            요금제 안내 보기 →
          </Link>
        </div>
      </div>

      <BoostModal open={modalOpen} onClose={() => setModalOpen(false)} preselectedJobId={null} />
    </BusinessCenterShell>
  );
}
