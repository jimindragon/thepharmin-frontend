"use client";

import { useState } from "react";
import { getCompanyInitial } from "@/utils/companyInitial";

export function EntityLogo({
  name,
  logoUrl,
  size = 48,
  className,
}: {
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
        <span className="text-[13px] font-bold text-[#596373]">{getCompanyInitial(name)}</span>
      )}
    </div>
  );
}
