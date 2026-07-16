import clsx from "clsx";

interface BusinessStatCardProps {
  label: string;
  /** 숫자 값. unit prop을 함께 쓸 때는 숫자만 전달하세요. */
  value: string;
  /** 단위(명/건/개/원 등). 숫자보다 작고 연한 보조 색으로 렌더링됩니다. */
  unit?: string;
  /** 강조 보조 문구. emphasisVariant에 따라 색이 결정됩니다. */
  subEmphasis?: string;
  /** "urgent" = 빨강(경고), "neutral" = 회색(기본) */
  emphasisVariant?: "neutral" | "urgent";
  /** 일반 보조 문구(항상 회색) */
  sub?: string;
}

export function BusinessStatCard({
  label,
  value,
  unit,
  subEmphasis,
  emphasisVariant = "neutral",
  sub,
}: BusinessStatCardProps) {
  return (
    <div className="px-5 py-5">
      <p className="text-[12px] font-medium text-[#8a94a3]">{label}</p>
      <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.03em] text-[#17202c]">
        {value}
        {unit && (
          <span className="ml-1 text-[20px] font-medium text-[#8a94a3]">{unit}</span>
        )}
      </p>
      <div className="mt-1.5 min-h-[18px] text-[12px] text-[#68717e]">
        {subEmphasis && (
          <span
            className={clsx(
              "font-semibold",
              emphasisVariant === "urgent" ? "text-status-urgent" : "text-[#68717e]",
            )}
          >
            {subEmphasis}
          </span>
        )}
        {subEmphasis && sub && <span className="text-[#c0c8d2]"> · </span>}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

interface BusinessStatGridProps {
  children: React.ReactNode;
  cols?: 3 | 4;
  className?: string;
}

export function BusinessStatGrid({
  children,
  cols = 4,
  className,
}: BusinessStatGridProps) {
  return (
    <div className={clsx("mt-6 border border-[#dfe4ea] bg-white", className)}>
      <div
        className={clsx(
          "grid max-[900px]:grid-cols-2 max-[640px]:grid-cols-1",
          cols === 3 ? "grid-cols-3" : "grid-cols-4",
          // 기본(데스크톱): 각 행 첫 셀만 좌측 구분선 제거, 둘째 행부터 상단 구분선
          "[&>*]:border-l [&>*]:border-[#dfe4ea]",
          cols === 3
            ? "[&>*:nth-child(3n+1)]:border-l-0 [&>*:nth-child(n+4)]:border-t [&>*:nth-child(n+4)]:border-[#dfe4ea]"
            : "[&>*:nth-child(4n+1)]:border-l-0 [&>*:nth-child(n+5)]:border-t [&>*:nth-child(n+5)]:border-[#dfe4ea]",
          // max-900px(2열)에서는 홀수 번째가 각 행의 시작 셀
          "max-[900px]:[&>*:nth-child(2n+1)]:border-l-0 max-[900px]:[&>*:nth-child(n+3)]:border-t max-[900px]:[&>*:nth-child(n+3)]:border-[#dfe4ea]",
          // max-640px(1열)에서는 좌측 구분선 없이 모든 행 사이에 상단 구분선
          "max-[640px]:[&>*]:border-l-0 max-[640px]:[&>*:nth-child(n+2)]:border-t max-[640px]:[&>*:nth-child(n+2)]:border-[#dfe4ea]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
