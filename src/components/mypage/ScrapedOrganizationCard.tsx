"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { EntityLogo } from "@/components/ui/EntityLogo";
import type { ScrapedOrganization } from "@/data/scraps";

const typeLabels: Record<ScrapedOrganization["type"], string> = {
  company: "기업",
  hospital: "병원",
  pharmacy: "약국",
};

export function ScrapedOrganizationCard({
  organization,
  onRemove,
}: {
  organization: ScrapedOrganization;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="group relative flex min-h-[112px] items-center gap-4 border border-[#dfe4ea] bg-white p-5 transition-colors hover:border-brand/55 hover:bg-[#fbfcfc] max-[480px]:flex-col max-[480px]:items-stretch">
      <Link href={organization.href} className="absolute inset-0 z-10" aria-label={`${organization.name} 상세 보기`}>
        <span className="sr-only">{organization.name} 상세 보기</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <EntityLogo name={organization.name} logoText={organization.logoText} size={48} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-bold tracking-[-0.01em] text-[#1c2128]">{organization.name}</h3>
            <span className="shrink-0 border border-[#e5e9ef] bg-[#f7f8fa] px-2 py-0.5 text-[11px] font-medium text-[#596373]">
              {typeLabels[organization.type]}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[13px] font-normal leading-[1.6] text-[#68717e]">{organization.summary}</p>
          <p className="mt-1.5 text-[12px] font-medium text-[#8a94a3]">
            {organization.activeJobCount > 0 ? (
              <>
                진행 중 공고 <strong className="font-bold text-[#303946]">{organization.activeJobCount}건</strong>
              </>
            ) : (
              "현재 진행 중인 공고 없음"
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(organization.id);
        }}
        className="relative z-20 inline-flex h-[36px] shrink-0 items-center gap-1.5 border border-[#d9e1e8] bg-white px-3 text-[12px] font-medium text-[#596373] transition-colors hover:border-brand hover:text-brand max-[480px]:w-full max-[480px]:justify-center"
        aria-label={`${organization.name} 스크랩 해제`}
      >
        <Bookmark size={16} strokeWidth={1.8} fill="currentColor" />
        스크랩 해제
      </button>
    </article>
  );
}
