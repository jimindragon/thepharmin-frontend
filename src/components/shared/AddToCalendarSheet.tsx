"use client";

import { CalendarPlus, Download } from "lucide-react";
import { ModalShell } from "@/components/ui/ModalShell";
import {
  buildGoogleCalendarUrl,
  buildIcs,
  downloadIcs,
  toAbsoluteUrl,
  type CalendarExportEvent,
} from "@/lib/calendarExport";

/**
 * "내 캘린더에 추가" 2택 시트.
 *
 * ≤480px에서는 ModalShell이 바텀시트가 되고(self-end + max-w-none), 그 위는 중앙 다이얼로그다.
 * 두 선택지의 성격이 달라 한 줄 CTA로 합칠 수 없다 — 구글은 새 탭 이동이고 기기 캘린더는
 * 파일 다운로드라, 무엇이 일어날지 누르기 전에 알려야 한다.
 *
 * 열림 상태를 prop으로 받되 닫힌 동안 ModalShell을 아예 마운트하지 않는다 —
 * ModalShell의 Escape·스크롤 잠금 effect가 마운트 시점에만 걸리는 구조라서다.
 */

const OPTION_CLASS =
  "flex h-12 w-full items-center justify-center gap-2 border border-border bg-white text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand";

export function AddToCalendarSheet({
  open,
  onClose,
  event,
}: {
  open: boolean;
  onClose: () => void;
  /** url은 사이트 상대 경로여도 된다 — 절대화는 아래 핸들러 안에서 한다. */
  event: CalendarExportEvent;
}) {
  if (!open) return null;

  /**
   * 절대 URL 조립은 렌더가 아니라 핸들러에서 한다. window.location은 서버에 없어
   * 렌더 중 읽으면 하이드레이션이 어긋난다.
   */
  const resolveEvent = (): CalendarExportEvent => ({
    ...event,
    url: event.url ? toAbsoluteUrl(event.url) : undefined,
  });

  const handleGoogle = () => {
    window.open(buildGoogleCalendarUrl(resolveEvent()), "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleIcs = async () => {
    const resolved = resolveEvent();
    await downloadIcs(`${resolved.uid}.ics`, buildIcs(resolved));
    onClose();
  };

  return (
    <ModalShell title="내 캘린더에 추가" onClose={onClose} maxWidth="max-w-[400px]">
      {/* ModalShell 바텀시트에 safe-area 없음 — 호출부에서 보정 (진단 4-c).
          ≤480px에서 패널이 화면 하단에 딱 붙어(self-end + 오버레이 pb-0) 마지막 버튼이
          홈 인디케이터에 걸린다. ModalShell을 건드리지 않고 여기서만 여백을 준다. */}
      <div className="px-6 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <p className="text-[13px] font-normal leading-[1.6] text-[#68717e]">
          {event.kind === "start" ? "접수 시작일을" : "서류 마감일을"} 캘린더에 저장합니다.
        </p>
        <div className="mt-4 grid gap-2">
          <button type="button" onClick={handleGoogle} className={OPTION_CLASS}>
            <CalendarPlus size={16} />
            구글 캘린더에 추가
          </button>
          <button type="button" onClick={handleIcs} className={OPTION_CLASS}>
            <Download size={16} />
            기기 캘린더에 추가 (.ics)
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
