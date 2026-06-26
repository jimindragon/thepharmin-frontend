"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { jobPostings, jobTrackLabel } from "@/data/businessJobs";
import { BOOST_OPTIONS } from "@/data/boostOptions";

type PaymentMethod = "신용카드" | "계좌이체" | "간편결제";
const PAYMENT_METHODS: PaymentMethod[] = ["신용카드", "계좌이체", "간편결제"];

function formatKrw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

interface BoostModalProps {
  open: boolean;
  onClose: () => void;
  /** jobPostings의 id. null이면 드롭다운 미선택 상태로 시작. */
  preselectedJobId?: string | null;
}

export function BoostModal({ open, onClose, preselectedJobId }: BoostModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedBoostId, setSelectedBoostId] = useState<string>("1w");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("신용카드");

  const activeJobs = jobPostings.filter((j) => j.status === "active");

  useEffect(() => {
    if (open) {
      setSelectedJobId(preselectedJobId ?? "");
      setSelectedBoostId("1w");
      setPaymentMethod("신용카드");
    }
  }, [open, preselectedJobId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const selectedBoost = BOOST_OPTIONS.find((o) => o.id === selectedBoostId)!;
  const discountAmount = selectedBoost.originalKrw - selectedBoost.discountedKrw;
  const canPay = !!selectedJobId;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="부스트 적용"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-[480px] flex-col border border-[#d8dee6] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)] max-h-[92dvh] max-[480px]:max-h-[100dvh] max-[480px]:max-w-none max-[480px]:self-end">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e5e9ef] px-6 py-4">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">부스트 적용</h2>
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
          <div className="space-y-6">
            {/* ① 적용할 공고 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={1} />
                <span className="text-[14px] font-semibold text-[#17202c]">적용할 공고</span>
              </div>
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className={clsx(
                    "w-full appearance-none border bg-white px-4 py-3.5 pr-10 text-[14px] transition focus:border-[#17A68C] focus:outline-none",
                    selectedJobId
                      ? "border-[#cfd8e3] text-[#17202c]"
                      : "border-[#cfd8e3] text-[#a0aab6]",
                  )}
                >
                  <option value="" disabled>공고를 선택하세요</option>
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({jobTrackLabel(job.track)})
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a94a3]"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* ② 이용 기간 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={2} />
                <span className="text-[14px] font-semibold text-[#17202c]">이용 기간</span>
              </div>
              <div className="space-y-2">
                {BOOST_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={clsx(
                      "flex cursor-pointer items-center justify-between gap-3 border px-4 py-3.5 transition-colors",
                      selectedBoostId === opt.id
                        ? "border-[#17A68C] bg-[#f4fdf9]"
                        : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="boost-modal-period"
                        value={opt.id}
                        checked={selectedBoostId === opt.id}
                        onChange={() => setSelectedBoostId(opt.id)}
                        className="h-[18px] w-[18px] cursor-pointer accent-[#17A68C]"
                      />
                      <span className="whitespace-nowrap text-[14px] font-bold text-[#17202c]">{opt.label}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="border border-[#e2998a] px-1.5 py-0.5 text-[11px] font-medium text-[#c0523b]">
                        {opt.discountPct}%
                      </span>
                      <span className="text-[12px] text-[#a0a9b7] line-through">{formatKrw(opt.originalKrw)}</span>
                      <span className="text-[16px] font-bold tracking-[-0.01em] text-[#17202c]">
                        {formatKrw(opt.discountedKrw)}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ③ 결제 수단 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={3} />
                <span className="text-[14px] font-semibold text-[#17202c]">결제 수단</span>
              </div>
              <div className="grid grid-cols-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={clsx(
                      "border-y border-r py-3 text-[13px] font-medium transition first:border-l",
                      paymentMethod === method
                        ? "border-[#17A68C] bg-[#f4fdf9] font-semibold text-[#17A68C]"
                        : "border-[#cfd8e3] bg-white text-[#4f5967] hover:border-[#17A68C] hover:text-[#17A68C]",
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* 금액 요약 */}
            <div className="border-t border-[#e5e9ef] pt-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-normal text-[#8a94a3]">{selectedBoost.label} 정가</span>
                  <span className="text-[13px] font-normal text-[#596373]">
                    {formatKrw(selectedBoost.originalKrw)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-normal text-[#8a94a3]">입점 할인</span>
                  <span className="text-[13px] font-semibold text-[#e04a2a]">
                    -{formatKrw(discountAmount)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-[#e5e9ef] pt-4">
                <span className="text-[14px] font-bold text-[#17202c]">결제 금액</span>
                <div className="text-right">
                  <p className="text-[26px] font-bold tracking-[-0.025em] text-[#17202c]">
                    {selectedBoost.discountedKrw.toLocaleString("ko-KR")}
                    <span className="text-[17px]">원</span>
                  </p>
                  <p className="text-[11px] font-normal text-[#a0aab6]">VAT 별도</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA — 실제 결제 라우트 미구현, 모달 닫기로 대체 */}
        <div className="shrink-0 px-6 pb-6 pt-2">
          <button
            type="button"
            disabled={!canPay}
            onClick={() => { onClose(); }}
            className={clsx(
              "w-full py-4 text-[15px] font-bold text-white transition",
              canPay ? "cursor-pointer hover:brightness-105" : "cursor-not-allowed opacity-50",
            )}
            style={canPay ? { backgroundImage: "var(--gradient-cta)" } : { background: "#c0c8d2" }}
          >
            {formatKrw(selectedBoost.discountedKrw)} 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center bg-[#111111] text-[11px] font-bold text-white">
      {n}
    </span>
  );
}
