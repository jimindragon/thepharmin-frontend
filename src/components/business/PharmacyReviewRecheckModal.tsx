"use client";

import { useState } from "react";
import clsx from "clsx";
import { ModalShell } from "@/components/ui/ModalShell";

/**
 * 사실관계 재검토 신청. 유료 서비스라 이 창의 절반은 "무엇을 사는 것이 아닌지"를 말하는 데 쓴다.
 *
 * 돈을 내면 후기가 내려간다는 기대가 생기는 순간 이 기능은 평판 세탁 창구가 된다. 그래서 고지 박스와
 * 결과 안내가 CTA 위에 있고, 동의 체크 전에는 버튼이 눌리지 않는다 — 읽지 않고 지나칠 수 있는 자리에
 * 두지 않는다. 네 가지 결과(유지·수정·비공개·삭제)를 나열하는 것도 같은 이유다.
 *
 * CTA는 검정 solid다. 그라데이션은 전환 CTA의 자리인데, 이 버튼은 유료 신청을 확정하는 행동이라
 * 눈에 띄게 만들 이유가 없다.
 */

const PRICE_LABEL = "이용료 건당 300,000원 (VAT 별도)";
const DISCLAIMER =
  "본 비용은 사실관계 확인 및 검토 절차에 대한 이용료이며, 후기의 삭제 또는 비공개 처리를 보장하지 않습니다.";
const OUTCOME_NOTICE =
  "검토 결과에 따라 후기가 유지되거나, 내용이 수정되거나, 작성자 동의하에 비공개 처리되거나, 운영정책에 따라 삭제될 수 있습니다.";
const AGREE_LABEL = "위 내용을 확인했으며 동의합니다.";

export function PharmacyReviewRecheckModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [reason, setReason] = useState("");

  const canSubmit = agreed && reason.trim().length > 0;

  return (
    <ModalShell
      title="사실관계 재검토 신청"
      headerVariant="emphasis"
      description="후기 내용에 사실관계 이견이 있는 경우, 운영팀의 추가 확인과 검토를 요청할 수 있는 유료 서비스입니다."
      onClose={onClose}
      maxWidth="max-w-[520px]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <p className="text-[15px] font-semibold text-[#17202c]">{PRICE_LABEL}</p>

        {/* 고지는 박스로 세운다 — 본문 흐름에 섞어 두면 가격 다음 줄로 읽히고 만다 */}
        <div className="mt-3 border border-[#dfe4ea] bg-[#f7f8fa] px-4 py-3.5">
          <p className="text-[13px] font-normal leading-[1.7] text-[#4f5967]">{DISCLAIMER}</p>
        </div>

        <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#68717e]">{OUTCOME_NOTICE}</p>

        <div className="mt-5">
          <p className="text-[14px] font-medium text-[#2f3845]">신청 사유</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="어떤 내용이 사실과 다른지 구체적으로 작성해 주세요."
            className="mt-2 h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[15px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#111111]"
          />
          <span className="text-[14px] font-medium leading-[1.5] text-[#2f3845]">{AGREE_LABEL}</span>
        </label>
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
          재검토 신청하기
        </button>
      </div>
    </ModalShell>
  );
}
