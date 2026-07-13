"use client";

import { Lock, X } from "lucide-react";

interface InterviewUnlockConfirmModalProps {
  /** 차감 전 보유 장수. 모달은 "{credits}장 → {credits-1}장"을 보여준다. */
  credits: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 면접 후기 열람권 1장 사용 확인 모달. mypage/resume의 ConfirmDialog(삭제 등 파괴적 동작용, 빨간 아이콘)와는
 * 별개로 company/ 폴더에 로컬로 둔다 — 이 모달은 파괴적 동작이 아니라 회색 계열 잠금 아이콘을 쓴다.
 */
export function InterviewUnlockConfirmModal({ credits, onConfirm, onCancel }: InterviewUnlockConfirmModalProps) {
  const nextCredits = Math.max(credits - 1, 0);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-5" role="dialog" aria-modal="true" aria-label="면접 후기를 열람할까요?">
      <div className="w-full max-w-[400px] border border-[#d8dee6] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e9ef] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center bg-[#f4f6f8] text-[#596373]">
              <Lock size={18} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#242b36]">면접 후기를 열람할까요?</h3>
              <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">
                열람권 1장이 사용됩니다.
                <br />
                열람 후에는 추가 차감 없이 다시 볼 수 있어요.
              </p>
              <p className="mt-2 text-[12.5px] font-medium text-[#3f4855]">
                보유 {credits}장 → {nextCredits}장
              </p>
            </div>
          </div>
          <button type="button" onClick={onCancel} aria-label="닫기" className="grid h-8 w-8 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]">
            <X size={16} />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#44505f] hover:border-[#111111] hover:text-[#111111]"
          >
            취소
          </button>
          <button type="button" onClick={onConfirm} className="h-10 border border-[#111111] bg-[#111111] px-4 text-[13px] font-medium text-white hover:bg-[#2a2a2a]">
            열람하기
          </button>
        </div>
      </div>
    </div>
  );
}
