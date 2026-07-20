"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { jobPostings, jobTrackLabel } from "@/data/businessJobs";
import { BOOST_PRICING, trackToPricingCat, type BoostGrade } from "@/data/boostPricing";

type PaymentMethod = "신용카드" | "계좌이체" | "간편결제";
const PAYMENT_METHODS: PaymentMethod[] = ["신용카드", "계좌이체", "간편결제"];

interface GradeOption {
  id: BoostGrade;
  name: string;
  badge: string;
}

const GRADE_OPTIONS: GradeOption[] = [
  { id: "premium", name: "PREMIUM", badge: "최상단 추천 영역" },
  { id: "featured", name: "FEATURED", badge: "상단 추천 영역" },
  { id: "standard", name: "STANDARD", badge: "추천 공고 영역" },
];

const WEEK_OPTS: { weeks: 1 | 2 | 3 | 4; label: string; discountLabel: string | null }[] = [
  { weeks: 1, label: "1주", discountLabel: null },
  { weeks: 2, label: "2주", discountLabel: "30%" },
  { weeks: 3, label: "3주", discountLabel: "40%" },
  { weeks: 4, label: "4주", discountLabel: "50%" },
];

function formatKrw(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

interface BoostModalProps {
  open: boolean;
  onClose: () => void;
  /** jobPostings의 id. null이면 드롭다운 미선택 상태로 시작. */
  preselectedJobId?: string | null;
  /** 주어지면 공고 선택 단계를 건너뛰고 해당 공고로 고정한다(연장 모드). */
  initialJobId?: string;
  /** 연장 모드에서 상품 선택 단계의 기본 선택 등급(변경 가능). */
  initialGrade?: BoostGrade;
}

export function BoostModal({ open, onClose, preselectedJobId, initialJobId, initialGrade }: BoostModalProps) {
  const isExtendMode = !!initialJobId;
  const stepOffset = isExtendMode ? 1 : 0;

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<BoostGrade>("premium");
  const [selectedWeeks, setSelectedWeeks] = useState<1 | 2 | 3 | 4>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("신용카드");

  const activeJobs = jobPostings.filter((j) => j.status === "active");

  useEffect(() => {
    if (open) {
      setSelectedJobId(initialJobId ?? preselectedJobId ?? "");
      setSelectedGrade(initialGrade ?? "premium");
      setSelectedWeeks(1);
      setPaymentMethod("신용카드");
    }
  }, [open, preselectedJobId, initialJobId, initialGrade]);

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

  const selectedJob = jobPostings.find((j) => j.id === selectedJobId) ?? null;
  const pricingCat = selectedJob ? trackToPricingCat(selectedJob.track) : null;
  const pricePoint = pricingCat
    ? BOOST_PRICING[selectedGrade][pricingCat].find((p) => p.weeks === selectedWeeks) ?? null
    : null;
  const discountAmount = pricePoint ? pricePoint.originalKrw - pricePoint.discountedKrw : 0;
  const selectedGradeOption = GRADE_OPTIONS.find((g) => g.id === selectedGrade)!;
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
            {!isExtendMode && (
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
            )}

            {/* ② 상품 선택 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={2 - stepOffset} />
                <span className="text-[14px] font-semibold text-[#17202c]">상품 선택</span>
              </div>
              {isExtendMode && (
                <p className="mb-3 text-[13px] font-normal text-[#8a94a3]">
                  현재 부스트 종료 다음 날부터 적용됩니다
                </p>
              )}
              <div className="space-y-2">
                {GRADE_OPTIONS.map((g) => (
                  <label
                    key={g.id}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 border px-4 py-3.5 transition-colors",
                      selectedGrade === g.id
                        ? "border-[#17A68C] bg-[#f4fdf9]"
                        : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                    )}
                  >
                    <input
                      type="radio"
                      name="boost-modal-grade"
                      value={g.id}
                      checked={selectedGrade === g.id}
                      onChange={() => setSelectedGrade(g.id)}
                      className="h-[18px] w-[18px] cursor-pointer accent-[#17A68C]"
                    />
                    <span className="text-[14px] font-bold text-[#17202c]">{g.name} — {g.badge}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ③ 이용 기간 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={3 - stepOffset} />
                <span className="text-[14px] font-semibold text-[#17202c]">이용 기간</span>
              </div>
              <div className="space-y-2">
                {WEEK_OPTS.map((opt) => {
                  const point = pricingCat
                    ? BOOST_PRICING[selectedGrade][pricingCat].find((p) => p.weeks === opt.weeks) ?? null
                    : null;
                  return (
                    <label
                      key={opt.weeks}
                      className={clsx(
                        "flex cursor-pointer items-center justify-between gap-3 border px-4 py-3.5 transition-colors",
                        selectedWeeks === opt.weeks
                          ? "border-[#17A68C] bg-[#f4fdf9]"
                          : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="boost-modal-period"
                          value={opt.weeks}
                          checked={selectedWeeks === opt.weeks}
                          onChange={() => setSelectedWeeks(opt.weeks)}
                          className="h-[18px] w-[18px] cursor-pointer accent-[#17A68C]"
                        />
                        <span className="whitespace-nowrap text-[14px] font-bold text-[#17202c]">{opt.label}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {opt.discountLabel && (
                          <span className="border border-[#e2998a] px-1.5 py-0.5 text-[11px] font-medium text-[#c0523b]">
                            {opt.discountLabel}
                          </span>
                        )}
                        {point && (
                          <>
                            {point.originalKrw !== point.discountedKrw && (
                              <span className="text-[12px] text-[#a0a9b7] line-through">{formatKrw(point.originalKrw)}</span>
                            )}
                            <span className="text-[16px] font-bold tracking-[-0.01em] text-[#17202c]">
                              {formatKrw(point.discountedKrw)}
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ④ 결제 수단 */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <StepBadge n={4 - stepOffset} />
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
              {pricePoint ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-normal text-[#8a94a3]">{selectedGradeOption.name} {selectedWeeks}주 정가</span>
                    <span className="text-[13px] font-normal text-[#596373]">
                      {formatKrw(pricePoint.originalKrw)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-normal text-[#8a94a3]">오픈 프로모션 할인</span>
                        <span className="text-[13px] font-semibold text-status-urgent">
                          -{formatKrw(discountAmount)}
                        </span>
                      </div>
                      <p className="text-[12px] font-normal text-[#a0aab6]">선택한 기간에 따라 오픈 기념 프로모션가가 적용됩니다.</p>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[13px] font-normal text-[#8a94a3]">공고를 먼저 선택하면 상품별 금액이 표시됩니다.</p>
              )}
              <div className="mt-4 flex items-end justify-between border-t border-[#e5e9ef] pt-4">
                <span className="text-[14px] font-bold text-[#17202c]">결제 금액</span>
                <div className="text-right">
                  <p className="text-[26px] font-bold tracking-[-0.025em] text-[#17202c]">
                    {pricePoint ? pricePoint.discountedKrw.toLocaleString("ko-KR") : "-"}
                    {pricePoint && <span className="text-[17px]">원</span>}
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
              "w-full py-4 text-[15px] font-bold transition",
              canPay ? "cursor-pointer text-white hover:brightness-110 active:brightness-90" : "cursor-not-allowed opacity-60",
            )}
            style={
              canPay
                ? { backgroundImage: "var(--gradient-cta)", transition: "filter 160ms ease", textShadow: "0 1px 3px rgba(5,60,55,0.28)" }
                : { background: "var(--color-disabled-bg)", color: "var(--color-disabled-text)" }
            }
          >
            {pricePoint ? `${formatKrw(pricePoint.discountedKrw)} 결제하기` : "결제하기"}
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
