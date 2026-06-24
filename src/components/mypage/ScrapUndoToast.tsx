"use client";

import { useEffect } from "react";

const AUTO_DISMISS_MS = 4000;

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
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <div className="dropdown-panel flex items-center gap-4 border border-[#20242b] bg-[#17202c] px-5 py-3.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        <p className="text-[13px] font-medium">{message}</p>
        <button
          type="button"
          onClick={onUndo}
          className="shrink-0 whitespace-nowrap border border-white/25 px-3 py-1.5 text-[12px] font-semibold text-white hover:border-white/60"
        >
          되돌리기
        </button>
      </div>
    </div>
  );
}
