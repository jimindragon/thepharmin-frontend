"use client";

import clsx from "clsx";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { EntityLogo } from "@/components/ui/EntityLogo";
import type { ScrapedOrganization } from "@/data/scraps";

const typeLabels: Record<ScrapedOrganization["type"], string> = {
  company: "기업",
  research: "연구기관",
  hospital: "병원",
  pharmacy: "약국",
};

/**
 * JobCard와 같은 분기 방식으로 맞춘다. 이쪽 루트는 .surface가 아니라 순수 유틸리티라
 * border-x-0 덮어쓰기로도 되지만, 두 카드가 같은 목록 문법을 공유하므로 구성 방식을 통일한다.
 * flush: 모바일 풀블리드 목록용 — 테두리는 목록 컨테이너의 divide-y가 담당.
 */
const ROOT_CLASS = {
  default: "border border-[#dfe4ea] hover:border-[#111111]/55",
  flush:
    // 카드가 화면 끝에 붙는 구간에서는 p-5(20px)가 곧 화면 여백이 된다 —
    // 같은 화면의 h1·탭이 선 --shell-gutter/2(=24px, ≤760px)에 좌우만 맞춘다(상하는 20px 유지).
    "max-[760px]:px-6 min-[761px]:border min-[761px]:border-[#dfe4ea] min-[761px]:hover:border-[#111111]/55",
} as const;

export function ScrapedOrganizationCard({
  organization,
  onRemove,
  variant = "default",
}: {
  organization: ScrapedOrganization;
  onRemove: (id: string) => void;
  variant?: "default" | "flush";
}) {
  return (
    <article
      className={clsx(
        "group relative flex min-h-[112px] items-center gap-4 bg-white p-5 transition-colors hover:bg-[#fbfcfc] max-[480px]:flex-col max-[480px]:items-stretch",
        ROOT_CLASS[variant],
      )}
    >
      <Link href={organization.href} className="absolute inset-0 z-10" aria-label={`${organization.name} 상세 보기`}>
        <span className="sr-only">{organization.name} 상세 보기</span>
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <EntityLogo
          name={organization.name}
          logoUrl={organization.logoUrl}
          size={48}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold tracking-[-0.01em] text-[#1c2128]">{organization.name}</h3>
            <span className="shrink-0 border border-[#e5e9ef] bg-[#f7f8fa] px-2 py-0.5 text-[13px] font-medium text-[#596373]">
              {typeLabels[organization.type]}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[13px] font-normal leading-[1.6] text-[#68717e]">{organization.summary}</p>
          <p className="mt-1.5 text-[13px] font-normal text-[#8a94a3]">
            {organization.activeJobCount > 0 ? (
              <>
                진행 중 공고 <strong className="font-semibold text-[#303946]">{organization.activeJobCount}건</strong>
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
        className="relative z-20 inline-flex h-[36px] shrink-0 items-center gap-1.5 border border-[#d9e1e8] bg-white px-3 text-[13px] font-medium text-[#596373] transition-colors hover:border-brand hover:text-brand max-[480px]:w-full max-[480px]:justify-center"
        aria-label={`${organization.name} 관심 해제`}
      >
        <Bookmark size={16} strokeWidth={1.8} fill="currentColor" />
        관심 해제
      </button>
    </article>
  );
}
