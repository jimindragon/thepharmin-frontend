"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { headerActions, navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { LinkButton } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <a href="/" className="flex shrink-0 items-center" aria-label="더파마 리크루트 홈으로 이동">
          <img
            src="/images/new_logo.svg"
            alt="더파마 리크루트"
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </a>

        <nav className="flex min-w-0 flex-1 items-center gap-6 text-[14px] max-[1120px]:hidden">
          {navigationItems.map((item) => {
            const isActive =
              item.href !== "#" &&
              ((pathname === "/" && item.href === "/jobs") || pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <a
                key={item.label}
                href={item.href}
                className={
                  item.highlight
                    ? "font-medium text-white hover:text-white"
                    : isActive
                      ? "relative font-semibold text-white after:absolute after:-bottom-[22px] after:left-0 after:h-[3px] after:w-full after:bg-white"
                      : "font-medium text-white/62 hover:text-white"
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 max-[1120px]:hidden">
          {headerActions.map((action) => (
            <LinkButton
              key={action.label}
              href={action.href}
              variant={action.tone === "brand" ? "gradient" : "secondary"}
              tone="dark"
              size="sm"
            >
              {action.label}
            </LinkButton>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5 border-l border-white/15 pl-4 text-white/82 max-[640px]:gap-2 max-[640px]:border-l-0 max-[640px]:pl-0">
          <button className="grid h-9 w-9 place-items-center hover:bg-white/10 max-[420px]:hidden" aria-label="검색">
            <Search size={20} strokeWidth={2} />
          </button>
          <button className="relative grid h-9 w-9 place-items-center hover:bg-white/10" aria-label="알림">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-[#050505]" />
          </button>
          <button className="flex items-center gap-2 py-1 pl-1 pr-1.5 hover:bg-white/10 max-[520px]:gap-1.5 max-[520px]:pr-1.5">
            <span className="grid h-[30px] w-[30px] place-items-center border border-white/20 bg-[#222222] text-[14px] font-medium text-white">
              김
            </span>
            <span className="whitespace-nowrap text-[13px] font-medium text-white/88 max-[720px]:hidden">{siteConfig.userName}</span>
            <ChevronDown size={16} color="rgba(255,255,255,0.58)" className="max-[520px]:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
