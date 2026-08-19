"use client";

import { AlertTriangle, Lock, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * 되돌리기 어렵거나 한 번 더 확인받아야 하는 동작 앞에 세우는 공용 확인 모달.
 *
 * tone은 아이콘과 확인 버튼 색을 한 축으로 묶는다.
 *   danger(기본) — 빨간 확인 버튼 + 경고 아이콘. 삭제처럼 되돌릴 수 없는 동작.
 *   neutral      — 검정 확인 버튼, 아이콘 없음. 되돌릴 수 있는 동작(공고 게시 전 확인).
 *   info         — 검정 확인 버튼 + 회색 잠금 아이콘. 파괴적이지 않지만 비용이 드는 동작(열람권 사용).
 *                  **이 톤만 가운데 정렬 위계다** — 아래 분기 주석 참조.
 * 기본값이 danger이므로 tone을 넘기지 않던 호출부의 렌더는 그대로다.
 *
 * 배경 클릭으로는 닫지 않는다 — 확인 다이얼로그는 실수로 닫히면 안 되는 성격이라 의도적으로
 * 뺐다(ModalShell·OverlayPanel과 다른 점). Escape는 취소와 같은 뜻이라 onCancel로 잇는다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다.
 * Escape·스크롤 잠금 effect가 마운트 시점에만 걸려야 하기 때문이다.
 */

/** tone별 아이콘. neutral은 아이콘 자체가 없어 이 표에 없다. */
const ICON_BY_TONE = {
  danger: { Icon: AlertTriangle, className: "bg-[#fdf2f0] text-danger" },
  info: { Icon: Lock, className: "bg-[#fafafa] text-[#596373]" },
} as const;

/**
 * note 안의 숫자만 600으로 든다. 잔량 안내("보유 2장 → 1장")에서 실제로 읽어야 하는 것은 두 수이고,
 * 나머지는 그 둘을 잇는 말이다. 색으로 강조하지 않는 것은 이 값이 경고가 아니라 사실이라서다.
 *
 * 문자열일 때만 손댄다 — 호출부가 노드를 직접 조립해 넘기면 그쪽 의도가 우선이다.
 * 같은 규칙이 InterviewAccessStatusCard의 emphasizeAmount에 이미 있다(그쪽은 "N장" 단위로 든다).
 */
function emphasizeNoteDigits(note: ReactNode): ReactNode {
  if (typeof note !== "string") return note;
  return note.split(/(\d+)/).map((part, index) =>
    /^\d+$/.test(part) ? (
      <span key={index} className="font-semibold">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function ConfirmDialog({
  ariaLabel,
  title,
  description,
  descriptionSize = "sm",
  note,
  confirmLabel = "삭제",
  cancelLabel = "취소",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  /**
   * 스크린리더가 읽는 대화상자 이름. 제목만으로는 어느 화면의 확인창인지 갈리지 않는 경우가 있어
   * (4개 트랙의 공고 게시 확인이 모두 "게시 전에 확인해 주세요"다) 호출부가 직접 넘긴다.
   */
  ariaLabel: string;
  title: string;
  /** 줄바꿈이 필요한 경우를 위해 ReactNode를 받는다. 문자열이면 그대로 한 줄이다. */
  description: ReactNode;
  /** 설명 글자 크기. sm(기본) 13px / md 15px */
  descriptionSize?: "sm" | "md";
  /** 설명 아래 한 줄짜리 부가 정보(예: "보유 2장 → 1장"). 없으면 렌더하지 않는다. */
  note?: ReactNode;
  confirmLabel?: string;
  /** 취소 쪽 문구. 기본값 "취소"라 넘기지 않던 호출부의 렌더는 그대로다. */
  cancelLabel?: string;
  tone?: "danger" | "neutral" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // 확인 버튼은 색만 갈린다 — 높이·여백·타이포는 세 톤이 같아야 한다.
  const confirmColorClass = tone === "danger" ? "border-danger bg-danger" : "border-[#111111] bg-[#111111]";
  /**
   * hover도 톤을 따라간다. 검정 버튼에 brightness-95를 걸면 변화가 눈에 잡히지 않아
   * 한 단계 밝은 색으로 바꿔 준다 — 빨간 danger 버튼은 brightness로 충분히 드러난다.
   */
  const confirmHoverClass = tone === "danger" ? "hover:brightness-95" : "hover:bg-[#2a2a2a]";
  const icon = tone === "neutral" ? null : ICON_BY_TONE[tone];

  /**
   * info만 가운데 정렬 위계다 — 아이콘 → 제목 → 설명 → 잔량 박스 → 버튼 행이 한 축에 선다.
   *
   * 좌측 정렬(danger·neutral과 공유하던 머리글 문법)에서는 아이콘이 제목 옆에 붙어 제목 줄을 밀고,
   * 그 아래 설명·잔량이 아이콘 폭만큼 들여쓰인 채로 이어졌다. 그 배치는 "무엇을 지웁니다" 한 줄을
   * 빠르게 읽히게 하는 자리에 맞고, 이쪽은 반대다 — 열람권을 쓸지 말지를 정하려면 잔량이 문장 옆이
   * 아니라 눈이 멈추는 자리에 있어야 한다. 그래서 잔량만 박스로 떼어 축 위에 세운다.
   *
   * danger·neutral은 아래 분기를 타지 않아 렌더가 그대로다(삭제 확인·공고 게시 확인 등 8지점).
   */
  if (tone === "info") {
    return (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-5" role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div className="relative w-full max-w-[400px] border border-border bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          {/* 닫기는 축 밖이라 절대 위치다 — 가운데 기둥에 끼우면 아이콘과 같은 줄을 두고 다투게 된다 */}
          <button
            type="button"
            onClick={onCancel}
            aria-label="닫기"
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={16} />
          </button>
          <div className="px-6 pb-6 pt-8 text-center">
            {icon ? (
              <span className={`mx-auto grid h-11 w-11 place-items-center ${icon.className}`}>
                <icon.Icon size={20} />
              </span>
            ) : null}
            <h3 className="mt-4 text-[16px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h3>
            <p
              className={`mt-2 ${descriptionSize === "md" ? "text-[15px]" : "text-[13px]"} font-normal leading-[1.6] text-[#68717e]`}
            >
              {description}
            </p>
            {note ? (
              <p className="mt-5 border border-border bg-[#fafafa] px-4 py-3 text-[14px] font-normal text-[#3f4855]">
                {emphasizeNoteDigits(note)}
              </p>
            ) : null}
            {/* 두 버튼은 같은 폭이다 — 가운데 기둥 아래에서 한쪽만 넓으면 축이 다시 한쪽으로 쏠린다 */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-11 flex-1 border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#44505f] hover:border-[#111111] hover:text-[#111111]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`h-11 flex-1 border ${confirmColorClass} px-4 text-[13px] font-medium text-white ${confirmHoverClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-5" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="w-full max-w-[400px] border border-border bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center ${icon.className}`}>
                <icon.Icon size={18} />
              </span>
            ) : null}
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h3>
              <p className={`mt-1.5 ${descriptionSize === "md" ? "text-[15px]" : "text-[13px]"} font-normal leading-[1.6] text-[#68717e]`}>{description}</p>
              {note ? <p className="mt-2 text-[13px] font-medium text-[#3f4855]">{note}</p> : null}
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
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={`h-10 border ${confirmColorClass} px-4 text-[13px] font-medium text-white ${confirmHoverClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
