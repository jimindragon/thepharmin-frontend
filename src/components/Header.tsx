"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems, trackNavigationItems } from "@/config/navigation";
import { myPageMenuGroups, myPageUser } from "@/config/myPageMenu";
import { siteConfig } from "@/config/site";
import { headerDropdownActionClassName, headerNavItemClassName } from "@/components/headerNavStyles";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

export function AccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = usePersonalLoginState();
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();

  // 기업 계정 메뉴의 로그아웃(BusinessAccountMenu)과 같은 순서 — 세션을 끊고, 메뉴를 닫고, 홈으로 보낸다.
  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        // 아바타는 aria-hidden이고 이름 텍스트는 720px 이하에서 숨으므로, 이름을 마크업에 기대지 않고 여기서 직접 준다.
        aria-label={`${myPageUser.name}님 계정 메뉴`}
        className="flex items-center gap-2 py-1 pl-1 pr-1.5 hover:bg-white/10 max-[520px]:gap-1.5 max-[520px]:pr-1.5"
      >
        <PersonAvatar label={myPageUser.name} size={30} />
        <span className="whitespace-nowrap text-[13px] font-medium text-white/90 max-[720px]:hidden">{siteConfig.userName}</span>
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.58)"
          className={clsx("transition-transform max-[520px]:hidden", open && "rotate-180")}
        />
      </button>

      {open ? (
        // 3그룹 11항목이라 노트북 높이에서 로그아웃까지 넘친다. 패널 상단은 헤더(64px) 아래 8px에
        // 붙으므로 뷰포트에서 그 72px과 하단 여백 16px을 빼야 잘리지 않는다 — 고정 px는 720 높이에서 다시 넘친다.
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 max-h-[calc(100vh-88px)] w-[260px] overflow-y-auto border border-border bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-[14px] font-bold text-[#17202c]">{myPageUser.name} 님</p>
            <p className="mt-0.5 text-[13px] font-normal text-[#6b7480]">{myPageUser.email}</p>
          </div>
          <div className="h-px bg-[#edf1f5]" />
          <div className="py-2">
            {myPageMenuGroups.map((group) => (
              // 라벨 위(pt-3 + 앞 그룹 pb-1.5 = 18px)는 넓고 아래(mt-0.5 = 2px)는 좁다 —
              // 라벨이 아래 항목 묶음에 붙어야 "이 묶음의 제목"으로 읽힌다. 첫 그룹만 pt-1 —
              // 위에 이메일 아래 구분선이 이미 있어 같은 12px을 주면 과하게 벌어진다.
              <div key={group.title} className="px-1 pb-1.5 pt-3 first:pt-1">
                <p className="px-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#6b7480]">{group.title}</p>
                <div className="mt-0.5">
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
                          <span className={clsx("text-[12px] font-normal", active ? "text-[#596373]" : "text-[#6b7480]")}>{item.badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* 로그아웃 — 이동 항목들과 성격이 달라 구분선으로 갈라 둔다. */}
          <div className="border-t border-border px-1 py-1.5">
            <button type="button" onClick={handleLogout} className={headerDropdownActionClassName}>
              로그아웃
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { isLoggedIn } = usePersonalLoginState();

  // 로그인 화면 자기 자신에서는 redirect를 붙이지 않는다 — 로그인 후 다시 로그인 화면으로 돌아오게 된다.
  const loginHref =
    pathname === "/login" || pathname === "/signup" ? "/login" : `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="site-header sticky top-0 z-50 h-[64px] border-b border-[#151515] bg-[#050505] text-white">
      <div className="app-shell flex h-full items-center gap-6 max-[900px]:gap-4 max-[520px]:gap-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="더파마 리크루트 홈으로 이동">
          <img
            src="/images/white_logo_1.svg"
            alt="더파마 리크루트"
            width={254}
            height={25}
            className="h-[25px] w-[254px] object-contain max-[900px]:h-[23px] max-[900px]:w-[234px] max-[520px]:h-[21px] max-[520px]:w-[214px]"
          />
        </Link>

        {/* 메뉴 라벨은 어떤 폭에서도 글자 단위로 쪼개지면 안 되므로 whitespace-nowrap 고정.
            대신 폭이 모자라면 아래 보조 메뉴 묶음을 통째로 숨겨서 감당한다. */}
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-10 text-[14px] max-[1120px]:hidden">
          <div className="flex items-center gap-[18px]">
            {trackNavigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a key={item.label} href={item.href} className={clsx("whitespace-nowrap", headerNavItemClassName(isActive))}>
                  {item.label}
                </a>
              );
            })}
          </div>
          {/* 보조 메뉴 5개 — 9개가 한 줄에 들어가려면 1280px이 필요하다(실측 필요 484.7px / 가용 490.3px).
              그룹 내 gap은 여유 5.6px가 남는 18px이 상한이다(20px이면 8.4px 넘쳐 우측 pill과 겹친다).
              그 미만에서는 핵심인 트랙 4개만 남긴다. */}
          <div className="flex items-center gap-[18px] max-[1279px]:hidden">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <a key={item.label} href={item.href} className={clsx("whitespace-nowrap", headerNavItemClassName(isActive))}>
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* 기업 서비스 진입 — 낮은 비중의 보조 텍스트 링크.
            nav가 1120px 이하에서 숨으므로(max-[1120px]:hidden) 노출 기준을 1121px로 맞춘다.
            1120px을 양쪽이 함께 포함하면 그 한 지점에서만 pill이 nav 없이 홀로 남는다. */}
        <a
          href="/business"
          className="hidden shrink-0 items-center whitespace-nowrap rounded-full border border-white/35 px-3 py-1 text-[13px] font-medium text-white/65 transition-colors hover:border-white/50 hover:text-white/80 min-[1121px]:inline-flex"
        >
          기업 서비스
        </a>

        <div className="ml-auto flex items-center gap-2.5 border-l border-white/15 pl-4 text-white/80 max-[640px]:gap-2 max-[640px]:border-l-0 max-[640px]:pl-0">
          {isLoggedIn ? (
            <>
              <NotificationBell notifications={MOCK_PERSONAL_NOTIFICATIONS} viewAllHref="/mypage/notifications" scope="personal" />
              <AccountMenu />
            </>
          ) : (
            /* 기업 헤더(BusinessHeaders)의 비로그인 로그인/가입 버튼과 같은 구조·치수를 쓴다.
               색만 다크 헤더 톤으로 바꿨다 — 기업 헤더는 흰 배경이라 그쪽 회색을 그대로 쓰면 검은 헤더에서 보이지 않는다.
               가입 버튼만 520px 미만에서 숨긴다(헤더의 기존 520 브레이크포인트). 로그인은 유일한 진입로라 항상 남긴다. */
            <div className="flex items-center gap-2">
              <Link href={loginHref} className="inline-flex h-10 items-center px-3 text-[12px] font-medium text-white/90 hover:text-white">
                로그인
              </Link>
              <Link
                href="/signup"
                className="hidden h-10 items-center border border-white/35 px-3 text-[12px] font-medium text-white/90 hover:border-white/50 hover:text-white min-[521px]:inline-flex"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
