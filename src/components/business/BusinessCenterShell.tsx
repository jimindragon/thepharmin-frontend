"use client";

import clsx from "clsx";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ApprovalGatePanel } from "@/components/business/ApprovalGatePanel";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { SidebarHelpCard } from "@/components/ui/SidebarHelpCard";
import { businessCenterHomeItem, businessCenterMenuGroups, isApprovalGatedPath } from "@/config/businessCenterMenu";
import { initialBusinessCompanyProfile, initialIndustryOrgManager } from "@/data/businessCompanyProfile";
import { useBusinessMember } from "@/hooks/useBusinessMember";
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
    // 모바일: 탭바가 1차 동선 담당 — 스트립은 6그룹 중 1개만 노출되던 상태 (진단 1-2)
    // ≤1040px 분기는 지우지 않고 남긴다 — 탭바를 되돌리면 스트립이 그대로 살아난다(마이페이지 선례).
    <aside className="border-r border-border bg-white px-6 py-7 max-[1040px]:hidden max-[1040px]:border-r-0 max-[1040px]:border-b max-[1040px]:px-5">
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

/**
 * 기업 세션이 없을 때 기업센터 본문 자리에 대신 놓이는 안내.
 * 접근 제어가 아니라 목업 검증용이다 — 로그인 전 화면이 로그인 후 화면과 섞이지 않게 갈라 준다.
 * 실제 차단은 인증이 붙을 때 서버가 한다.
 *
 * 마크업은 같은 셸의 기존 게이트(ApprovalGatePanel)를 그대로 따른다.
 */
function LoginRequiredPanel({ redirectTo }: { redirectTo: string }) {
  // 로그인 후 막혀 있던 그 화면으로 되돌린다 — 셸이 이미 읽어 둔 pathname을 그대로 받는다.
  const loginHref = `/business/login?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <Lock size={20} className="text-[#6b7280]" />
      <h2 className="mt-4 text-[17px] font-bold text-[#17202c]">로그인이 필요합니다</h2>
      <p className="mt-2 max-w-[520px] text-[15px] font-normal leading-[1.7] text-[#68717e]">
        기업센터는 기업 계정으로 로그인한 뒤 이용할 수 있습니다.
      </p>
      <div className="mt-7">
        <LinkButton href={loginHref} variant="primary">
          기업 로그인
        </LinkButton>
      </div>
      <p className="mt-4 text-[13px] text-[#68717e]">
        <Link href="/business/signup" className="font-medium text-[#111111] underline underline-offset-2">
          기업 계정 신청
        </Link>
      </p>
    </div>
  );
}

export function BusinessCenterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMember = useBusinessMember();
  const orgVerificationStatus = useOrgVerificationStatus();
  const isGated = orgVerificationStatus === "pending" && isApprovalGatedPath(pathname);

  // 비로그인이면 사이드바까지 함께 감춘다 — 사이드바가 회사명·인증 상태를 그대로 드러내
  // 본문만 가려서는 "로그인 전 화면"이 되지 않는다. 헤더는 그대로 두어 진입로를 남긴다.
  if (!isMember) {
    return (
      <>
        <BusinessHeader />
        <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
          <div className="app-shell">
            <LoginRequiredPanel redirectTo={pathname} />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <BusinessHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7]">
        <div className="app-shell grid grid-cols-[260px_minmax(0,1fr)] max-[1040px]:grid-cols-1">
          <BusinessSidebar />
          {/* ≤760px는 px-0 — 셸 gutter(24px)가 이미 좌우를 잡고 있어 px-4가 겹치면 40px이 된다.
              761~1040px은 사이드바만 빠지고 폭은 넉넉해 기존 px-4를 그대로 둔다. (마이페이지 선례)

              pt-8(32px) — h1 위 여백의 출처를 이 컨테이너 하나로 모은다. 공개 페이지가
              `app-shell pt-8` + PageTitle `max-[760px]:mt-0`으로 잡아 둔 32px과 같은 값이고,
              같은 방식으로 각 페이지의 h1은 ≤760px에서 자기 mt를 0으로 접는다. 이전에는
              컨테이너 24 + 페이지마다 제각각인 mt(20/12/0)가 더해져 44·36·24로 갈렸다.
              pb는 6(24px) 그대로 — 아래는 탭바 보정(globals.css body:has)이 따로 잡는다. */}
          <div className="min-w-0 py-8 pl-8 max-[1040px]:px-4 max-[760px]:px-0 max-[760px]:pb-6 max-[760px]:pt-8">
            {isGated ? <ApprovalGatePanel /> : children}
          </div>
        </div>
      </main>
    </>
  );
}
