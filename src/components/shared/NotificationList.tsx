"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useNotificationReadState, type NotificationScope } from "@/hooks/useNotificationReadState";
import { getNotificationTypeLabel, type Notification } from "@/types/notifications";

type TabId = "all" | "unread";

interface NotificationListProps {
  notifications: Notification[];
  scope: NotificationScope;
}

/**
 * 개인·기업 알림 목록의 공용 본문 — 탭 줄 + 목록 카드 + 행.
 * 두 페이지가 같은 마크업을 각자 들고 있던 것을 그대로 옮겼다(클래스 문자열 무변경).
 * 브레드크럼·h1·설명문은 페이지마다 값이 달라 호출부에 남긴다 — 여기로 끌어들이면
 * 그 자리가 새 분기점이 된다.
 * 탭 줄 상단 마진만 옮기면서 mt-6으로 통일했다(개인이 쓰던 mt-7에서 4px 줄어든다).
 */
export function NotificationList({ notifications, scope }: NotificationListProps) {
  const { markRead, markAllRead, isRead, isLoaded } = useNotificationReadState(scope);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const sorted = [...notifications].sort((a, b) =>
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
    <>
      <div className="mt-6 flex items-center justify-between border-b border-border">
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
              // 접힘 분기는 이 컴포넌트만 840이다(코드베이스 관례는 760) — 좌측 라벨 + 우측 날짜로 텍스트 칼럼이 좁아
              // 830px대에서 제목이 2줄이 된다. 실측: 768px에서 개인 4건·기업 1건, 790px에서 개인 3건이 2줄이었다.
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => markRead(notification.id)}
                  className="group flex items-start gap-3 border-t border-t-[#e5e9ef] px-6 py-5 first:border-t-0 max-[840px]:flex-wrap"
                >
                  <span className={clsx("mt-[9px] h-[8px] w-[8px] shrink-0 rounded-full", !read && "bg-danger")} aria-hidden="true" />
                  {/* 유형 라벨 — 최장 "공고·부스트"가 13px Pretendard에서 58.52px(실측)이라 w-[60px]로 잡았다.
                      받은 제안과 달리 세로 헤어라인을 두지 않는다 — 거기선 라벨이 행의 주 정보지만 알림은 제목이 주이고 라벨은 보조다. */}
                  {/* mt-[3.5px]는 13px 라벨의 baseline을 16px 제목 첫 줄 baseline에 정확히 맞추는 값(실측 오차 0px). 우측 날짜도 같은 값을 쓴다. */}
                  <span className="mt-[3.5px] w-[60px] shrink-0 whitespace-nowrap text-[13px] text-[#8a94a3]">
                    {getNotificationTypeLabel(scope, notification.type)}
                  </span>
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
                  </div>
                  {/* ≤840px에서는 날짜+화살표를 통째로 아래 줄로 내린다(840인 이유는 위 주석 참고) — 우측에 그대로 두면
                      390px에서 제목 칼럼이 124px까지 눌린다. 화살표까지 함께 내려야 152px이 나온다(날짜만 내리면 124px 그대로).
                      pl-[92px]는 점(8) + gap(12) + 라벨(60) + gap(12)의 합으로 날짜를 제목 왼쪽 끝에 맞추는 값이라, w-[60px]를 바꾸면 함께 고친다. */}
                  <div className="flex shrink-0 items-start gap-3 max-[840px]:w-full max-[840px]:justify-between max-[840px]:pl-[92px]">
                    <span className="mt-[3.5px] whitespace-nowrap text-[13px] text-[#8a94a3]">{notification.createdAt}</span>
                    <ChevronRight size={16} aria-hidden="true" className="mt-[5px] shrink-0 text-[#9aa3af]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
