"use client";

import { useState } from "react";
import { PharmacyLogo } from "@/components/ui/PharmacyLogo";

export function EntityLogo({
  name,
  logoText,
  logoUrl,
  size = 48,
  className,
  /** 약국 전용 fallback. 로고가 없거나(logoUrl 누락) 이미지 로딩에 실패했을 때만 약국명 기반 자동 로고를 보여준다 */
  isPharmacy,
}: {
  name: string;
  logoText?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
  isPharmacy?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !imageFailed;

  if (!showImage && isPharmacy) {
    return <PharmacyLogo name={name} size={size} className={className} />;
  }

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[#e5e9ef] bg-[#f7f8fa] ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" onError={() => setImageFailed(true)} />
      ) : (
        <span className="text-[13px] font-bold text-[#596373]">{(logoText ?? name).slice(0, 2)}</span>
      )}
    </div>
  );
}
