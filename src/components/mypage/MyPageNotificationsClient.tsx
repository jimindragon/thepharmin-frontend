"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";
import { useNotificationReadState } from "@/hooks/useNotificationReadState";

type TabId = "all" | "unread";

export function MyPageNotificationsClient() {
  const { markRead, markAllRead, isRead, isLoaded } = useNotificationReadState("personal");
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const sorted = [...MOCK_PERSONAL_NOTIFICATIONS].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );
  const unreadCount = sorted.filter((notification) => !isRead(notification.id)).length;
  // 읽음 상태 로드 전에는 미읽음 표현을 숨긴다 — mock 기본값 기준 깜빡임 방지. 목록 구조는 로드 전에도 그대로 렌더.
  const hasUnread = isLoaded && unreadCount > 0;
  // 미읽음 탭 목록은 로드 후 채운다(한 프레임 지연 수용, 대시보드와 동일 트레이드오프). 전체 탭은 항상 렌더.
  const visible = activeTab === "unread" ? (isLoaded ? sorted.filter((notification) => !isRead(notification.id)) : []) : sorted;

  const tabs: { id: TabId; label: string; count: number; countReady: boolean }[] = [
    { id: "all", label: "전체", count: sorted.length, countReady: true },
    { id: "unread", label: "미읽음", count: unreadCount, countReady: isLoaded },
  ];

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "알림" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">알림</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        받은 알림을 확인하고 관련 페이지로 이동할 수 있습니다.
      </p>

      <div className="mt-7 flex items-center justify-between border-b border-border">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "relative flex h-11 shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition",
                activeTab === tab.id
                  ? "text-[#111111] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]"
                  : "text-[#8a94a3] hover:text-[#303946]",
              )}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
              {tab.countReady ? (
                <span
                  className={clsx(
                    "inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[13px] font-medium",
                    activeTab === tab.id ? "bg-[#111111] text-white" : "bg-[#f0f1f3] text-[#8a94a3]",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        {hasUnread ? (
          <button
            type="button"
            onClick={() => markAllRead(sorted.map((notification) => notification.id))}
            className="shrink-0 text-[13px] font-medium text-[#4f5967] transition-colors hover:text-[#111111]"
          >
            모두 읽음 처리
          </button>
        ) : null}
      </div>

      <div className="mt-3 border border-border bg-white">
        {visible.length === 0 ? (
          <p className="px-6 py-16 text-center text-[13px] text-[#68717e]">
            {activeTab === "unread" ? "미읽은 알림이 없습니다." : "새로운 알림이 없습니다."}
          </p>
        ) : (
          <div>
            {/* 구분선은 divide-* 대신 행별 border-top으로 둔다 — 행마다 border 색을 따로 지정하는 편이 divide 색상 유틸보다 다루기 쉽다. */}
            {visible.map((notification) => {
              const read = !isLoaded || isRead(notification.id);
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => markRead(notification.id)}
                  className="group flex items-start gap-3 border-t border-t-[#e5e9ef] px-6 py-5 first:border-t-0"
                >
                  <span className={clsx("mt-[9px] h-[8px] w-[8px] shrink-0 rounded-full", !read && "bg-danger")} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={clsx(
                        "text-[16px] text-[#17202c] transition-colors group-hover:text-[#111111]",
                        !read ? "font-semibold" : "font-medium",
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-[#68717e]">{notification.body}</p>
                    <p className="mt-1 text-[12px] text-[#a0a9b7]">{notification.createdAt}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MyPageShell>
  );
}
