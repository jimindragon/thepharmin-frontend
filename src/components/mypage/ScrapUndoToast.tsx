"use client";

import { useEffect } from "react";

// 모바일 한 손 조작 기준 4초는 짧음 — 되돌리기 도달 시간 확보
const AUTO_DISMISS_MS = 6000;

export function ScrapUndoToast({
  message,
  onUndo,
  onDismiss,
}: {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    // iOS 사파리 하단 툴바·홈 인디케이터 회피 (viewport-fit=cover 전제)
    <div
      className="fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="dropdown-panel flex items-center gap-4 border border-[#20242b] bg-[#17202c] px-5 py-3.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        <p className="text-[13px] font-medium">{message}</p>
        {/* min-h-[40px]: py만으로는 39px에서 걸려 터치 타깃 40px에 1px 모자란다.
            상자만 35→40px로 늘고 글자·테두리 크기는 그대로다. */}
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center whitespace-nowrap border border-white/25 px-3 py-1.5 text-[13px] font-medium text-white hover:border-white/60"
        >
          되돌리기
        </button>
      </div>
    </div>
  );
}
