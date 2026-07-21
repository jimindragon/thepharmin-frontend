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
  size?: number;
}

const MAX_VISIBLE = 5;

export function NotificationBell({ notifications, viewAllHref, scope, size = 20 }: NotificationBellProps) {
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();
  const { markRead, markAllRead, isRead } = useNotificationReadState(scope);

  const unreadCount = notifications.filter((notification) => !isRead(notification.id)).length;
  const hasUnread = unreadCount > 0;
  const isCompact = size < 20;

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
          isCompact ? "text-[#303946] hover:bg-[#f4f5f6]" : "hover:bg-white/10",
        )}
      >
        <Bell size={size} strokeWidth={2} />
        {hasUnread ? (
          <span
            className={clsx(
              "absolute rounded-full bg-danger",
              isCompact ? "right-2 top-2 h-2 w-2 ring-2 ring-white" : "right-2.5 top-2.5 h-2.5 w-2.5 ring-2 ring-[#050505]",
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
              <p className="text-[14px] font-bold text-[#17202c]">알림</p>
              <span className="text-[12px] text-[#8a94a3]">미읽음 {unreadCount}</span>
            </div>
            {hasUnread ? (
              <button
                type="button"
                onClick={() => markAllRead(notifications.map((notification) => notification.id))}
                className="text-[12px] font-medium text-[#4f5967] transition-colors hover:text-[#111111]"
              >
                모두 읽음
              </button>
            ) : null}
          </div>
          <div className="h-px bg-[#edf1f5]" />

          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-[#68717e]">새로운 알림이 없습니다.</p>
          ) : (
            <div className="max-h-[420px] divide-y divide-[#edf1f5] overflow-y-auto">
              {visible.map((notification) => {
                const read = isRead(notification.id);
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
                      className={clsx("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", !read && "bg-danger")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "text-[13px] text-[#17202c] transition-colors group-hover:text-[#111111]",
                          !read && "font-medium",
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-[1.5] text-[#68717e]">{notification.body}</p>
                      <p className="mt-1 text-[11px] text-[#a0a9b7]">{notification.createdAt}</p>
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
