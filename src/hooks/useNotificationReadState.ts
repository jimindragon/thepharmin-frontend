"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_BUSINESS_NOTIFICATIONS, MOCK_PERSONAL_NOTIFICATIONS } from "@/data/notifications";

export type NotificationScope = "personal" | "business";

const READ_CHANGED_EVENT = "thepharmin:notifications-read-changed";

function storageKey(scope: NotificationScope): string {
  return `thepharmin:notifications-read:${scope}`;
}

/** 벨·목록이 아직 localStorage를 읽지 못한 첫 렌더(SSR 포함)에 쓰는 기본값 — 목데이터 자체의 read 값. */
function getDefaultReadIds(scope: NotificationScope): Set<string> {
  const source = scope === "personal" ? MOCK_PERSONAL_NOTIFICATIONS : MOCK_BUSINESS_NOTIFICATIONS;
  return new Set(source.filter((notification) => notification.read).map((notification) => notification.id));
}

function readStoredIds(scope: NotificationScope): Set<string> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey(scope));
  if (!raw) return null;
  try {
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return null;
  }
}

function writeStoredIds(scope: NotificationScope, ids: Set<string>) {
  window.localStorage.setItem(storageKey(scope), JSON.stringify(Array.from(ids)));
  window.dispatchEvent(new CustomEvent(READ_CHANGED_EVENT, { detail: { scope } }));
}

/**
 * 개인/기업 알림의 읽음 상태를 벨 드롭다운과 목록 페이지가 공유하는 훅.
 * localStorage(`thepharmin:notifications-read:{scope}`)에 읽은 id 배열을 저장하고,
 * 같은 탭 안의 다른 인스턴스(벨 ↔ 목록)에는 커스텀 이벤트로 즉시 알린다 — storage 이벤트는
 * 같은 탭에서 발생하지 않으므로 대체 수단이 될 수 없다.
 */
export function useNotificationReadState(scope: NotificationScope) {
  const [readIds, setReadIds] = useState<Set<string>>(() => getDefaultReadIds(scope));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setReadIds(readStoredIds(scope) ?? getDefaultReadIds(scope));
    setIsLoaded(true);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ scope: NotificationScope }>).detail;
      if (detail?.scope !== scope) return;
      setReadIds(readStoredIds(scope) ?? getDefaultReadIds(scope));
    };

    window.addEventListener(READ_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(READ_CHANGED_EVENT, onChange);
  }, [scope]);

  // 주의: writeStoredIds(dispatchEvent 포함)는 setState 업데이터 함수 밖에서 호출해야 한다 —
  // 업데이터 안에서 호출하면 그 안에서 동기 발행되는 이벤트가 다른 컴포넌트의 setState를
  // "렌더링 중" 트리거해 React의 "Cannot update a component while rendering a different
  // component" 경고를 유발한다(실제로 재현되어 이렇게 고쳤다).
  const markRead = useCallback(
    (id: string) => {
      if (readIds.has(id)) return;
      const next = new Set(readIds);
      next.add(id);
      setReadIds(next);
      writeStoredIds(scope, next);
    },
    [scope, readIds],
  );

  const markAllRead = useCallback(
    (ids: string[]) => {
      const next = new Set(readIds);
      ids.forEach((id) => next.add(id));
      setReadIds(next);
      writeStoredIds(scope, next);
    },
    [scope, readIds],
  );

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return { readIds, markRead, markAllRead, isRead, isLoaded };
}
