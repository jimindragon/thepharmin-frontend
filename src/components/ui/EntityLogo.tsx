"use client";

import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { Building2 } from "lucide-react";

/**
 * 칸의 생김새 프리셋. Button의 variant와 같은 뜻 — "테두리·배경·기본 여백"을 한 덩어리로 고른다.
 *
 * square: 정사각 + 테두리 + 흰 배경. 아바타처럼 "고정된 자리"를 나타내는 맥락(계정 칩·목록 아이콘).
 * wide:   테두리·배경 없이 이미지만. 로고 자산 61개 중 93%가 가로형(중앙 비율 약 3:1)이라
 *         정사각 칸에 넣으면 칸의 2/3가 빈 공간이 된다. 목록 행·카드 헤더처럼 로고를 그대로
 *         보여주는 자리에서 width/height를 따로 줘서 쓴다.
 */
export type EntityLogoVariant = "square" | "wide";

/** 아이콘이 박스의 42~45%를 차지하도록. PersonAvatar와 같은 이유로 비례식 대신 구간으로 끊는다 */
function iconSizeFor(size: number): number {
  if (size <= 28) return 14;
  if (size >= 64) return 30;
  if (size >= 44) return 20;
  return 18;
}

/** variant별 이미지 안쪽 여백(px). square의 6은 종전 p-1.5와 같은 값이다 */
const DEFAULT_PADDING: Record<EntityLogoVariant, number> = {
  square: 6,
  wide: 2,
};

export function EntityLogo({
  logoUrl,
  size = 48,
  width,
  height,
  variant = "square",
  padding,
  fallback,
  className,
}: {
  /** 폴백이 아이콘이 된 뒤로는 렌더에 쓰이지 않는다. 로고 img의 alt를 채울 때 쓸 자리 */
  name: string;
  logoUrl?: string;
  /** 정사각 한 변. width/height를 따로 주면 그쪽이 이긴다 */
  size?: number;
  width?: number;
  height?: number;
  variant?: EntityLogoVariant;
  /** 이미지 안쪽 여백(px). 미지정 시 variant 기본값(square 6 / wide 2) */
  padding?: number;
  /**
   * 로고가 없거나 로드에 실패했을 때 대신 그릴 것. 미지정 시 건물 아이콘.
   * 목록 행처럼 로고 없는 항목이 여러 줄 연속으로 깔리는 화면은 전부 같은 아이콘이 되면
   * 행 구분이 사라지므로, 호출부가 회사명 이니셜 같은 식별 가능한 폴백을 넘긴다.
   */
  fallback?: ReactNode;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !imageFailed;

  const boxWidth = width ?? size;
  const boxHeight = height ?? size;
  const boxPadding = padding ?? DEFAULT_PADDING[variant];

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center overflow-hidden",
        variant === "square" && "border border-border bg-white",
        className,
      )}
      style={{ width: boxWidth, height: boxHeight }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={logoUrl}
          alt=""
          // min-h-0/min-w-0 필수 — grid 아이템의 자동 최소 크기(min-*: auto)가 걸리면
          // h-full/w-full보다 이미지의 고유 크기가 우선해 박스를 넘치고 잘린다.
          // 정사각 칸에서는 드러나지 않지만 비정사각(wide)에서는 바로 어긋난다.
          className="h-full w-full min-h-0 min-w-0 object-contain"
          style={{ padding: boxPadding }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        fallback ?? (
          // 비정사각에서는 짧은 변을 기준으로 — 긴 변에 맞추면 아이콘이 칸 밖으로 나간다
          <Building2 size={iconSizeFor(Math.min(boxWidth, boxHeight))} strokeWidth={1.75} className="text-[#596373]" />
        )
      )}
    </div>
  );
}
