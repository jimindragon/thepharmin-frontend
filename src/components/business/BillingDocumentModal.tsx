"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { boostTrackLabel, type BillingRecord } from "@/data/businessBilling";
import { initialBusinessCompanyProfile } from "@/data/businessCompanyProfile";

const PLATFORM_SUPPLIER = "더파마뉴스 · 570-86-03548";
const RECEIPT_FOOTER = "주식회사 더파마뉴스 · 570-86-03548 · recruit@thepharma.net";
const UNSUPPORTED_NOTICE = "정식 결제 연동 후 제공됩니다.";
const NOTICE_DISMISS_MS = 2400;

function formatKrw(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function toTotalKrw(supplyKrw: number): number {
  return Math.round(supplyKrw * 1.1);
}

function DocRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 text-[13px] ${last ? "" : "border-b border-[#f0f1f3]"}`}>
      <span className="text-[#8a94a3]">{label}</span>
      <span className="font-medium text-[#17202c]">{value}</span>
    </div>
  );
}

function DocTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-end justify-between border-t-2 border-[#17202c] pt-3">
      <span className="text-[14px] font-bold text-[#17202c]">{label}</span>
      <span className="text-[17px] font-bold text-[#17202c]">{value}</span>
    </div>
  );
}

interface BillingDocumentModalProps {
  open: boolean;
  variant: "receipt" | "taxInvoice";
  record: BillingRecord | null;
  onClose: () => void;
}

export function BillingDocumentModal({ open, variant, record, onClose }: BillingDocumentModalProps) {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (open) setShowNotice(false);
  }, [open, record?.id, variant]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open || !record) return null;

  const isCancelled = record.status === "cancelled";
  const totalKrw = toTotalKrw(record.amountKrw);
  const vatKrw = totalKrw - record.amountKrw;

  function handleUnsupportedAction() {
    setShowNotice(true);
    window.setTimeout(() => setShowNotice(false), NOTICE_DISMISS_MS);
  }

  const title =
    variant === "receipt" ? (isCancelled ? "취소 영수증" : "결제 영수증") : "세금계산서 발행 내역";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6 max-[480px]:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-[440px] flex-col border border-[#d8dee6] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)] max-h-[92dvh] max-[480px]:max-h-[calc(100dvh-24px)] max-[480px]:max-w-none max-[480px]:self-end">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-8 w-8 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={16} />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto px-6 py-6">
          {variant === "receipt" ? (
            <div>
              {/* 상품/공고 */}
              <div>
                <p className="text-[16px] font-semibold text-[#17202c]">{record.jobTitle}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-normal text-[#596373]">{record.productName}</span>
                  {/* leading-4: body의 line-height 1.65가 배지 안까지 상속되는 것을 끊은 국소 예외. 트랙 배지 4곳(본화면 3 + 영수증 모달)이 같은 처방을 쓴다 — 배지 높이를 전역 정리할 때 함께 볼 것 */}
                  <span className="inline-flex h-6 items-center border border-[#d8e0e8] px-1.5 text-[13px] font-medium leading-4 text-[#596373]">
                    {boostTrackLabel(record.track)}
                  </span>
                </div>
              </div>

              {/* 표 */}
              <div className="mt-5">
                <DocRow label="결제번호" value={record.paymentNo} />
                <DocRow label="결제일시" value={`${record.paidAt} ${record.paidAtTime}`} />
                <DocRow
                  label="결제수단"
                  value={
                    record.cardInfo
                      ? `${record.cardInfo.issuer} · ${record.cardInfo.maskedNo} · ${record.cardInfo.installment}`
                      : record.paymentMethod
                  }
                />
                <DocRow label="이용 기간" value={`${record.servicePeriod.from} ~ ${record.servicePeriod.to}`} />
                <DocRow label="공급가액" value={formatKrw(record.amountKrw)} />
                <DocRow label="VAT (10%)" value={formatKrw(vatKrw)} last />
                <DocTotal label="합계" value={formatKrw(totalKrw)} />
              </div>

              {/* 취소 정보 */}
              {isCancelled && (
                <div className="mt-4 border border-[#e5e9ef] bg-[#f7f8fa] px-4">
                  <DocRow label="상태" value="취소 완료" />
                  <DocRow label="취소일" value={record.canceledAt ?? "-"} />
                  <DocRow label="환불액" value={formatKrw(totalKrw)} />
                  <DocRow label="환불수단" value={record.refundMethod ?? "-"} last />
                </div>
              )}

              {/* 하단 소자 */}
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-[12px] font-normal text-[#a0aab6]">{RECEIPT_FOOTER}</p>
                <p className="mt-0.5 text-[12px] font-normal text-[#a0aab6]">본 영수증은 결제 내역 확인용입니다.</p>
              </div>
            </div>
          ) : (
            <div>
              {/* 품목 + 발행 상태 */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px] font-semibold text-[#17202c]">{record.productName}</p>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-semibold text-status-positive">발행 완료</p>
                  <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">{record.paidAt} 작성</p>
                </div>
              </div>

              {/* 표 */}
              <div className="mt-5">
                <DocRow label="공급자" value={PLATFORM_SUPPLIER} />
                <DocRow
                  label="공급받는자"
                  value={`${initialBusinessCompanyProfile.displayName} · ${initialBusinessCompanyProfile.businessNumber}`}
                />
                <DocRow label="공급가액" value={formatKrw(record.amountKrw)} />
                <DocRow label="세액" value={formatKrw(vatKrw)} last />
                <DocTotal label="합계" value={formatKrw(totalKrw)} />
              </div>

              {/* 하단 안내 */}
              <p className="mt-6 text-[12px] font-normal leading-[1.6] text-[#a0aab6]">
                발행 완료된 세금계산서의 정보는 변경되지 않습니다. 수정한 기업 정보는 다음 발행 건부터 적용됩니다.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0 px-6 pb-6 pt-2">
          {showNotice && (
            <p className="mb-2 text-center text-[12px] font-medium text-[#8a94a3]">{UNSUPPORTED_NOTICE}</p>
          )}
          <button
            type="button"
            onClick={handleUnsupportedAction}
            className="w-full border border-[#cfd8e3] py-3.5 text-[14px] font-semibold text-[#303946] transition hover:border-[#111111] hover:text-[#111111]"
          >
            {variant === "receipt" ? "영수증 인쇄" : "PDF 다운로드"}
          </button>
        </div>
      </div>
    </div>
  );
}
