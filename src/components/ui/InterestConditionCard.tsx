import { Info, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface InterestConditionCardProps {
  /** 빈 배열이면 "관심조건 없음" 상태(안내 문구 + CTA만)로, 하나 이상이면 칩 목록으로 렌더된다. */
  chips: string[];
  /** chips가 빈 배열일 때만 노출되는 안내 문구. */
  emptyStateText: ReactNode;
  /** chips가 있을 때만 CTA 아래에 노출되는 보조 설명 문구. */
  summaryText: string;
  /** chips가 있는 상태에서, 그 조건이 지금 실제로 필터에 적용되어 있는지. chips가 비어 있으면 무시된다. */
  applied: boolean;
  /** applied가 false일 때(또는 chips가 비어 있을 때) CTA에 쓰는 라벨. */
  primaryCtaLabel: string;
  /** applied가 true일 때 CTA에 쓰는 라벨 — 클릭하면 해제되는 액션이라는 뜻을 담아야 한다. */
  primaryCtaAppliedLabel: string;
  onPrimaryCtaClick: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryActionClick?: () => void;
  /** 카드 하단에 얹는 페이지별 부가 요소. 예: 이메일 알림 상태 표시. */
  bottomSlot?: ReactNode;
}

export function InterestConditionCard({
  chips,
  emptyStateText,
  summaryText,
  applied,
  primaryCtaLabel,
  primaryCtaAppliedLabel,
  onPrimaryCtaClick,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryActionClick,
  bottomSlot,
}: InterestConditionCardProps) {
  const hasChips = chips.length > 0;
  const showAppliedStyle = hasChips && applied;

  return (
    <div className="border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={17} strokeWidth={2} className="text-gray-700" />
          <h3 className="text-[15px] font-semibold text-[#171b20]">내 관심조건</h3>
        </div>
        <Info size={15} className="text-gray-400" />
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        {hasChips ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((label, index) => (
                <span key={`${label}-${index}`} className="bg-gray-100 px-2.5 py-1 text-[13px] leading-[1.4] text-[#3d4653]">
                  {label}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={onPrimaryCtaClick}
              className={
                showAppliedStyle
                  ? "mt-4 h-11 w-full border border-gray-300 text-[14px] font-semibold text-[#171b20] transition hover:bg-gray-50"
                  : "mt-4 h-11 w-full text-[14px] font-semibold text-white transition hover:brightness-95"
              }
              style={showAppliedStyle ? undefined : { backgroundImage: "var(--gradient-cta)" }}
            >
              {showAppliedStyle ? primaryCtaAppliedLabel : primaryCtaLabel}
            </button>

            {secondaryActionLabel && secondaryActionHref ? (
              <Link
                href={secondaryActionHref}
                onClick={onSecondaryActionClick}
                className="mt-2 flex h-11 w-full items-center justify-center border border-gray-300 text-[14px] font-semibold text-[#171b20] hover:bg-gray-50"
              >
                {secondaryActionLabel}
              </Link>
            ) : null}

            <p className="mt-4 text-[13px] text-gray-500">{summaryText}</p>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-[1.6] text-gray-500">{emptyStateText}</p>
            <button
              type="button"
              onClick={onPrimaryCtaClick}
              className="mt-4 h-11 w-full text-[14px] font-semibold text-white transition hover:brightness-95"
              style={{ backgroundImage: "var(--gradient-cta)" }}
            >
              {primaryCtaLabel}
            </button>
          </>
        )}
      </div>

      {bottomSlot ? <div className="mt-4">{bottomSlot}</div> : null}
    </div>
  );
}
