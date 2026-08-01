"use client";

import clsx from "clsx";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ApprovalGatePanel } from "@/components/business/ApprovalGatePanel";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { SidebarHelpCard } from "@/components/ui/SidebarHelpCard";
import { businessCenterHomeItem, businessCenterMenuGroups, isApprovalGatedPath } from "@/config/businessCenterMenu";
import { initialBusinessCompanyProfile, initialIndustryOrgManager } from "@/data/businessCompanyProfile";
import { useOrgVerificationStatus } from "@/hooks/useOrgVerificationStatus";

const LOCK_TITLE = "기업 인증 후 이용할 수 있습니다";

function SidebarLink({ label, href, active, locked }: { label: string; href: string; active: boolean; locked: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-between gap-2 border px-3 py-2.5 text-[14px] font-medium transition",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-transparent text-[#4f5967] hover:border-[#dfe4ea] hover:bg-[#f7f8fa] hover:text-[#111111]",
      )}
    >
      <span>{label}</span>
      {locked ? (
        <span title={LOCK_TITLE} aria-label={LOCK_TITLE} className="shrink-0">
          <Lock size={14} className="text-[#9aa3af]" aria-hidden="true" />
        </span>
      ) : null}
    </Link>
  );
}

export function BusinessSidebar() {
  const pathname = usePathname();
  const orgVerificationStatus = useOrgVerificationStatus();
  const allMenuHrefs = [businessCenterHomeItem.href, ...businessCenterMenuGroups.flatMap((group) => group.items.map((item) => item.href))];
  const longestMatchingHref = allMenuHrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .reduce<string | null>((longest, href) => (longest === null || href.length > longest.length ? href : longest), null);
  const isActive = (href: string) => href === longestMatchingHref;
  const isLocked = (href: string) => orgVerificationStatus === "pending" && isApprovalGatedPath(href);

  return (
    <aside className="border-r border-border bg-white px-6 py-7 max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5">
      {/* 마이페이지 사이드바(MyPageShell)와 같은 구조 — 이름/부제/상태칩.
          값은 헤더 프로필 드롭다운(BusinessAccountMenu)이 읽는 소스를 그대로 쓴다. */}
      <div>
        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">{initialBusinessCompanyProfile.displayName}</h2>
        <p className="mt-1 text-[13px] font-normal text-[#8a94a3]">
          {initialIndustryOrgManager.department} · {initialIndustryOrgManager.position}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex h-6 items-center border border-[#e5e9ef] bg-[#f7f8fa] px-2 text-[11px] font-medium text-[#596373]">
            {orgVerificationStatus === "pending" ? "기업 인증 심사 중" : "기업 인증 완료"}
          </span>
        </div>
      </div>
      <div className="mt-5 h-px bg-[#e5e9ef]" />
      {/* mt-3(12px) — 대시보드를 위 구분선 쪽으로 붙여 "상단 고정 항목"임을 위치로 드러낸다.
          아래 그룹과의 간격은 space-y-7(28px) 그대로라 위 12 < 아래 28로 소속이 갈린다.
          이전에는 20 vs 28이라 차이가 8px뿐이어서 대시보드가 양쪽 어디에도 안 붙어 보였다. */}
      <nav className="mt-3 space-y-7 max-[1040px]:flex max-[1040px]:gap-6 max-[1040px]:space-y-0 max-[1040px]:overflow-x-auto max-[1040px]:pb-2">
        {/* 그룹 밖 단독 항목이지만 라벨이 아니라 항목이므로 그룹 안 항목과 같은 정렬을 쓴다.
            이전에는 -ml-3로 텍스트를 그룹 라벨 x에 맞췄는데, 활성 박스 폭이 컨테이너로 결정돼
            좌측으로만 12px 넓어지면서(223px) 다른 항목(211px)보다 튀어나와 보였다. */}
        <div className="max-[1040px]:min-w-[156px]">
          <SidebarLink {...businessCenterHomeItem} active={isActive(businessCenterHomeItem.href)} locked={isLocked(businessCenterHomeItem.href)} />
        </div>
        {businessCenterMenuGroups.map((group) => (
          <div key={group.title} className="max-[1040px]:min-w-[156px]">
            <p className="text-[17px] font-bold text-[#222a35]">{group.title}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <SidebarLink key={item.href} {...item} active={isActive(item.href)} locked={isLocked(item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <SidebarHelpCard />
    </aside>
  );
}

export function BusinessCenterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const orgVerificationStatus = useOrgVerificationStatus();
  const isGated = orgVerificationStatus === "pending" && isApprovalGatedPath(pathname);

  return (
    <>
      <BusinessHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <div className="app-shell grid grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
          <BusinessSidebar />
          <div className="min-w-0 py-8 pl-8 max-[1040px]:px-4 max-[760px]:py-6">{isGated ? <ApprovalGatePanel /> : children}</div>
        </div>
      </main>
    </>
  );
}
