"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

/** 아이콘이 박스의 42~45%를 차지하도록. PersonAvatar와 같은 이유로 비례식 대신 구간으로 끊는다 */
function iconSizeFor(size: number): number {
  if (size <= 28) return 14;
  if (size >= 64) return 30;
  if (size >= 44) return 20;
  return 18;
}

export function EntityLogo({
  logoUrl,
  size = 48,
  className,
}: {
  /** 폴백이 아이콘이 된 뒤로는 렌더에 쓰이지 않는다. 로고 img의 alt를 채울 때 쓸 자리 */
  name: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !imageFailed;

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden border border-border bg-white ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" onError={() => setImageFailed(true)} />
      ) : (
        <Building2 size={iconSizeFor(size)} strokeWidth={1.75} className="text-[#596373]" />
      )}
    </div>
  );
}
