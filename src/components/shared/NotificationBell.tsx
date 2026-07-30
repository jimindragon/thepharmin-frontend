"use client";

import clsx from "clsx";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { useNotificationReadState, type NotificationScope } from "@/hooks/useNotificationReadState";
import type { Notification } from "@/types/notifications";

interface NotificationBellProps {
  notifications: Notification[];
  viewAllHref: string;
  scope: NotificationScope;
  /** 벨 아이콘 크기(px). 순수 크기값 — 색·hover·링은 tone이 결정한다. */
  size?: number;
  /**
   * 헤더 배경 톤. Eyebrow·Button·headerNavItemClassName과 같은 "light"|"dark" 관례.
   * 다른 컴포넌트와 달리 기본값이 "dark"인 이유: 벨을 쓰는 헤더 3곳 중 2곳(개인·고객센터)이
   * 검은 헤더라 그쪽을 무설정 기본으로 두는 편이 호출부가 조용하다.
   */
  tone?: "dark" | "light";
}

const MAX_VISIBLE = 5;

export function NotificationBell({ notifications, viewAllHref, scope, size = 20, tone = "dark" }: NotificationBellProps) {
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const { markRead, markAllRead, isRead, isLoaded } = useNotificationReadState(scope);

  const unreadCount = notifications.filter((notification) => !isRead(notification.id)).length;
  // 읽음 상태 로드 전에는 미읽음 표현(dot·카운트·강조)을 숨긴다 — mock 기본값 기준 깜빡임 방지.
  const hasUnread = isLoaded && unreadCount > 0;
  const isLight = tone === "light";

  const visible = [...notifications]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, MAX_VISIBLE);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="알림"
        className={clsx(
          "relative grid h-9 w-9 place-items-center",
          // 다크는 부모(흰 글자)를 그대로 상속받고, 라이트만 아이콘 색을 지정한다.
          isLight ? "text-[#303946] hover:bg-[#f4f5f6]" : "hover:bg-white/10",
        )}
      >
        <Bell size={size} strokeWidth={2} />
        {hasUnread ? (
          <span
            className={clsx(
              // 위치·크기는 20px 아이콘 기준 고정값. 톤에 따라 바뀌는 건 헤더 배경색과 맞물리는 링 색뿐.
              "absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2",
              isLight ? "ring-white" : "ring-[#050505]",
            )}
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="dropdown-panel absolute right-0 top-[calc(100%+8px)] z-30 w-[320px] border border-border bg-white shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-baseline gap-2">
              <p className="text-[15px] font-semibold text-[#17202c]">알림</p>
              {isLoaded ? <span className="text-[13px] text-[#8a94a3]">미읽음 {unreadCount}</span> : null}
            </div>
            {hasUnread ? (
              <button
                type="button"
                onClick={() => markAllRead(notifications.map((notification) => notification.id))}
                className="text-[13px] font-medium text-[#4f5967] transition-colors hover:text-[#111111]"
              >
                모두 읽음 처리
              </button>
            ) : null}
          </div>
          <div className="h-px bg-[#edf1f5]" />

          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#68717e]">새로운 알림이 없습니다.</p>
          ) : (
            <div className="max-h-[420px] divide-y divide-[#edf1f5] overflow-y-auto">
              {visible.map((notification) => {
                const read = !isLoaded || isRead(notification.id);
                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markRead(notification.id);
                      setOpen(false);
                    }}
                    className="group flex items-start gap-2.5 px-4 py-3"
                  >
                    <span
                      className={clsx("mt-[7.5px] h-[8px] w-[8px] shrink-0 rounded-full", !read && "bg-danger")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "text-[14px] text-[#17202c] transition-colors group-hover:text-[#111111]",
                          !read ? "font-semibold" : "font-medium",
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.5] text-[#68717e]">{notification.body}</p>
                      <p className="mt-1 text-[12px] text-[#a0a9b7]">{notification.createdAt}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="h-px bg-[#edf1f5]" />
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-[13px] font-medium text-[#4f5967] transition-colors hover:text-[#111111]"
          >
            전체 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}
