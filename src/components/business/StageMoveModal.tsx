"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/ModalShell";
import {
  applicantJobPostings,
  STAGE_TABS,
  type Applicant,
  type ApplicantStage,
} from "@/data/applicants";

const MOVABLE_STAGES = STAGE_TABS.filter(
  (tab): tab is { id: ApplicantStage; label: string } => tab.id !== "all" && tab.id !== "rejected",
);

interface StageMoveModalProps {
  open: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onConfirm: (stage: ApplicantStage) => void;
}

export function StageMoveModal({ open, applicant, onClose, onConfirm }: StageMoveModalProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicantStage | null>(null);

  useEffect(() => {
    if (open) setSelectedStage(null);
  }, [open, applicant?.id]);

  // 오버레이·패널·헤더·닫기 X·Escape·body 스크롤 잠금은 ModalShell이 맡는다.
  // ModalShell은 열림 여부를 갖지 않으므로 아래 조기 반환이 마운트/언마운트를 결정한다.
  if (!open || !applicant) return null;

  const postingTitle = applicantJobPostings.find((p) => p.id === applicant.postingId)?.title ?? "";
  const canMove = selectedStage !== null && selectedStage !== applicant.stage;

  function handleConfirm() {
    if (!canMove || !selectedStage) return;
    onConfirm(selectedStage);
    onClose();
  }

  return (
    <ModalShell title="단계 이동" onClose={onClose} maxWidth="max-w-[440px]">
      {/* 지원자 요약 */}
      <div className="shrink-0 border-b border-border px-6 py-4">
        <p className="text-[16px] font-semibold text-[#17202c]">{applicant.name}</p>
        <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">{postingTitle}</p>
      </div>

      {/* 스크롤 영역 */}
      <div className="overflow-y-auto px-6 py-6">
        <div className="space-y-2">
          {MOVABLE_STAGES.map((stageOpt) => {
            const isCurrent = applicant.stage === stageOpt.id;
            const isSelected = selectedStage === stageOpt.id;
            return (
              <label
                key={stageOpt.id}
                className={clsx(
                  "flex items-center gap-3 border px-4 py-3.5 transition-colors",
                  isCurrent
                    ? "cursor-not-allowed border-[#e5e9ef] bg-[#f7f8fa]"
                    : isSelected
                      ? "cursor-pointer border-[#17A68C] bg-[#f4fdf9]"
                      : "cursor-pointer border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
                )}
              >
                <input
                  type="radio"
                  name="stage-move"
                  value={stageOpt.id}
                  checked={isSelected}
                  disabled={isCurrent}
                  onChange={() => setSelectedStage(stageOpt.id)}
                  className="h-[18px] w-[18px] cursor-pointer accent-[#17A68C] disabled:cursor-not-allowed"
                />
                <span className="text-[14px] font-semibold text-[#17202c]">{stageOpt.label}</span>
                {isCurrent && (
                  <span className="ml-auto text-[12px] font-normal text-[#8a94a3]">현재 단계</span>
                )}
              </label>
            );
          })}
        </div>

        {/* 불합격 처리 */}
        <div className="mt-4 border-t border-border pt-4">
          <label
            className={clsx(
              "flex items-center gap-3 border px-4 py-3.5 transition-colors",
              applicant.stage === "rejected"
                ? "cursor-not-allowed border-[#e5e9ef] bg-[#f7f8fa]"
                : selectedStage === "rejected"
                  ? "cursor-pointer border-status-error bg-white"
                  : "cursor-pointer border-[#dfe4ea] bg-white hover:border-[#b0bac6]",
            )}
          >
            <input
              type="radio"
              name="stage-move"
              value="rejected"
              checked={selectedStage === "rejected"}
              disabled={applicant.stage === "rejected"}
              onChange={() => setSelectedStage("rejected")}
              className="h-[18px] w-[18px] cursor-pointer accent-[#a43f31] disabled:cursor-not-allowed"
            />
            <span className="text-[14px] font-semibold text-status-error">불합격 처리</span>
            {applicant.stage === "rejected" && (
              <span className="ml-auto text-[12px] font-normal text-[#8a94a3]">현재 단계</span>
            )}
          </label>
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0 px-6 pb-6 pt-2">
        <button
          type="button"
          disabled={!canMove}
          onClick={handleConfirm}
          className={clsx(
            "w-full py-3.5 text-[14px] font-bold transition",
            canMove
              ? "cursor-pointer bg-[#111111] text-white hover:brightness-110 active:brightness-90"
              : "cursor-not-allowed bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)]",
          )}
        >
          이동
        </button>
      </div>
    </ModalShell>
  );
}
