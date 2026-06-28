"use client";

import clsx from "clsx";
import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems, trackNavigationItems } from "@/config/navigation";
import { myPageMenuGroups, myPageUser } from "@/config/myPageMenu";
import { siteConfig } from "@/config/site";
import { headerNavItemClassName } from "@/components/headerNavStyles";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";

export function AccountMenu() {
  const pathname = usePathname();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 py-1 pl-1 pr-1.5 hover:bg-white/10 max-[520px]:gap-1.5 max-[520px]:pr-1.5"
      >
        <span className="grid h-[30px] w-[30px] place-items-center border border-white/20 bg-[#222222] text-[14px] font-medium text-white">
          김
        </span>
        <span className="whitespace-nowrap text-[13px] font-medium text-white/88 max-[720px]:hidden">{siteConfig.userName}</span>
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.58)"
          className={clsx("transition-transform max-[520px]:hidden", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 w-[260px] border border-[#e5e9ef] bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-[14px] font-bold text-[#17202c]">{myPageUser.name} 님</p>
            <p className="mt-0.5 text-[12px] font-normal text-[#8a94a3]">{myPageUser.email}</p>
          </div>
          <div className="h-px bg-[#edf1f5]" />
          <div className="py-2">
            {myPageMenuGroups.map((group) => (
              <div key={group.title} className="px-1 py-1.5">
                <p className="px-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#a0a9b7]">{group.title}</p>
                <div className="mt-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={clsx(
                          "flex items-center justify-between gap-3 px-2 py-2 text-[13px] font-medium transition-colors",
                          active ? "text-[#111111]" : "text-[#4f5967] hover:text-[#111111]",
                        )}
                      >
                        <span className={active ? "font-bold" : undefined}>{item.label}</span>
                        {item.badge ? (
                          <span className={clsx("text-[12px] font-normal", active ? "text-[#596373]" : "text-[#a0a9b7]")}>{item.badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <a href="/" className="flex shrink-0 items-center" aria-label="더파마 리크루트 홈으로 이동">
          <img
            src="/images/white_logo_1.svg"
            alt="더파마 리크루트"
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </a>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-12 text-[14px] max-[1120px]:hidden">
          <div className="flex items-center gap-6">
            {trackNavigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a key={item.label} href={item.href} className={headerNavItemClassName(isActive, "dark")}>
                  {item.label}
                </a>
              );
            })}
          </div>
          <div className="flex items-center gap-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a key={item.label} href={item.href} className={headerNavItemClassName(isActive, "dark")}>
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* 기업 서비스 진입 — 낮은 비중의 보조 텍스트 링크, 1120px 미만에서는 숨김 */}
        <a
          href="/business"
          className="hidden shrink-0 items-center whitespace-nowrap rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium text-white/45 transition-colors hover:border-white/35 hover:text-white/65 min-[1120px]:inline-flex"
        >
          기업 서비스
        </a>

        <div className="ml-auto flex items-center gap-2.5 border-l border-white/15 pl-4 text-white/82 max-[640px]:gap-2 max-[640px]:border-l-0 max-[640px]:pl-0">
          <button className="relative grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="알림">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-[#050505]" />
          </button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
