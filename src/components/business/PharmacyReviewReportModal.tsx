"use client";

import { useState } from "react";
import clsx from "clsx";
import { ModalShell } from "@/components/ui/ModalShell";

/**
 * 후기 신고. 운영정책 위반을 알리는 창구이고 비용이 없다 —
 * 사실관계 이견은 이 창이 아니라 사실관계 재검토(PharmacyReviewRecheckModal)로 간다.
 *
 * 그 갈림을 하단 한 줄로 못 박는 이유는, 두 창구가 없으면 "내용이 틀렸다"는 이의가 전부 신고로 몰리고
 * 신고는 판정 절차가 아니라서 아무것도 해결되지 않은 채 접수만 쌓이기 때문이다.
 */

const REPORT_REASONS = [
  { id: "abuse", label: "욕설·비방 포함" },
  { id: "privacy", label: "개인정보 노출" },
  { id: "spam", label: "스팸·광고성 내용" },
  { id: "not_employee", label: "실제 재직자가 아닌 것으로 의심됨" },
  { id: "etc", label: "기타" },
] as const;

type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];

export function PharmacyReviewReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [reason, setReason] = useState<ReportReasonId | null>(null);
  const [etcDetail, setEtcDetail] = useState("");

  /** 기타는 무엇이 문제인지가 라벨에 없어 그 칸이 곧 사유다 — 비어 있으면 접수할 내용이 없다. */
  const canSubmit = reason !== null && (reason !== "etc" || etcDetail.trim().length > 0);

  return (
    <ModalShell
      title="후기 신고"
      headerVariant="emphasis"
      description="운영정책을 위반한 것으로 판단되는 후기를 신고할 수 있습니다. 신고 접수에는 비용이 없으며, 운영팀 검토 후 처리 결과를 안내드립니다."
      onClose={onClose}
      maxWidth="max-w-[520px]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <p className="text-[14px] font-medium text-[#2f3845]">신고 사유</p>
        <div className="mt-2.5 grid gap-2">
          {REPORT_REASONS.map((option) => (
            <label
              key={option.id}
              className={clsx(
                "flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors",
                reason === option.id ? "border-[#111111] bg-[#f7f8fa]" : "border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
              )}
            >
              <input
                type="radio"
                name="review-report-reason"
                value={option.id}
                checked={reason === option.id}
                onChange={() => setReason(option.id)}
                className="h-[18px] w-[18px] cursor-pointer accent-[#111111]"
              />
              <span className="text-[14px] font-medium text-[#17202c]">{option.label}</span>
            </label>
          ))}
        </div>

        {reason === "etc" ? (
          <textarea
            value={etcDetail}
            onChange={(event) => setEtcDetail(event.target.value)}
            rows={3}
            placeholder="신고 사유를 입력해 주세요."
            className="mt-2.5 h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[15px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
          />
        ) : null}

        <p className="mt-5 border-t border-[#edf1f5] pt-4 text-[13px] font-normal leading-[1.65] text-[#68717e]">
          후기 내용의 사실관계에 대한 이견은 신고가 아닌 사실관계 재검토를 이용해 주세요.
        </p>
      </div>

      <div className="shrink-0 px-6 pb-6 pt-2">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={clsx(
            "w-full py-3.5 text-[14px] font-bold transition",
            canSubmit
              ? "cursor-pointer bg-[#111111] text-white hover:brightness-110 active:brightness-90"
              : "cursor-not-allowed bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)]",
          )}
        >
          신고 접수
        </button>
      </div>
    </ModalShell>
  );
}
