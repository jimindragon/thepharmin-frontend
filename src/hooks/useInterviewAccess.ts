"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { CompanyReviewCardItem, CompanyReviewInterviewAccess } from "@/components/company/CompanyReviewCard";
import type { InterviewAccessUserState } from "@/components/company/InterviewAccessStatusCard";
import { myUnlockedInterviewReviewsMock, reviewAccessMock } from "@/data/companies";
import { useReviewAccessDemo } from "@/hooks/useReviewAccessDemo";

/**
 * 면접 후기 열람권(credit) 데모의 상태기계. 실제 저장/인증은 없는 클라이언트 전용 목업이다.
 *
 * 보유 상태를 컴포넌트가 아니라 **모듈 스코프**에 둔다. 열람권은 화면이 아니라 계정에 딸린 값이라,
 * 개요에서 1장을 쓰고 목록으로 넘어갔더니 2장으로 돌아와 있으면 그 화면들이 서로 다른 지갑을 든
 * 셈이 된다. 목록 라우트(/interviews)는 외부 진입·딥링크·데스크톱 경로로 존치되므로 개요와
 * 목록을 오가는 길이 실제로 남아 있다.
 *
 * 실제 저장 파이프라인이 붙을 자리도 이 store 하나다 — 호출부와 계약(useInterviewAccess의 반환값)은
 * 그대로 두고 아래 읽기/쓰기만 서버로 옮기면 된다. 컴포넌트 로컬 useState로 두면 시그니처는 같아도
 * "화면에 들어올 때마다 초기화"라는 동작이 훅 안에 남아, 서버를 붙일 때 그 동작까지 함께 걷어내야 한다.
 *
 * DEV 프리셋(useReviewAccessDemo)은 이 훅이 안에서 직접 부른다 — 호출부는 isLoggedIn만 넘긴다.
 * userState는 그 프리셋(패널이 고른 값이 없으면 로그인 여부)이고, credits는 열람에 따라 실시간으로
 * 줄어든다. 카드별 잠금 판정은 userState가 loggedOut이 아닌 한 credits(0 여부)로 계산해
 * "열람 중 0장 도달" 전환을 자연스럽게 반영한다.
 */

interface InterviewAccessStore {
  /**
   * 이 탭에서 마지막으로 관측한 DEV 프리셋. useReviewAccessDemo는 localStorage를 서버에서 읽을 수 없어
   * **마운트할 때마다 첫 프레임에 null을 돌려준다**(그쪽 useState 기본값). 그 한 프레임을 그대로 믿으면
   * 화면을 옮길 때마다 userState가 "프리셋 → 로그인 기본값 → 프리셋"으로 튀고, 아래 리셋이 매번 돌아
   * 공유가 무의미해진다. 관측한 값을 여기 남겨 그 구멍을 메운다 — 저장소를 두 번 읽지 않는다.
   */
  preset: InterviewAccessUserState | null;
  /** 아래 보유 상태가 어느 userState 기준으로 깔린 것인지. null이면 아직 한 번도 깔리지 않았다. */
  syncedUserState: InterviewAccessUserState | null;
  credits: number;
  unlockedIds: string[];
  pendingUnlockId: string | null;
}

/** 서버 스냅샷이자 새 탭의 출발점. 얼려 두는 것은 아래 갱신이 전부 새 객체를 만들기 때문이다. */
const INITIAL: InterviewAccessStore = Object.freeze({
  preset: null,
  syncedUserState: null,
  credits: 0,
  unlockedIds: [],
  pendingUnlockId: null,
});

/** 리셋마다 새 배열을 만들면 useSyncExternalStore가 매번 바뀐 것으로 읽는다 */
const EMPTY_IDS: string[] = [];

/**
 * 이미 열람한 후기의 출발점. 마이페이지 "내가 열람한 후기"(myUnlockedInterviewReviewsMock)가 그 목록이라,
 * 두 화면이 같은 목업 하나를 읽는다 — 종전엔 여기가 빈 배열이라 마이페이지가 "열람 완료"라고 말한 후기가
 * 상세에서는 잠긴 채로 나왔고, "다시 보기"를 눌러 놓고 열람권을 한 장 더 써야 했다.
 *
 * **저장 파이프라인이 붙는 자리다** — 실서비스에서는 이 상수가 서버 조회(계정별 열람 이력)로 교체된다.
 * 아래 store의 읽기/쓰기 계약은 그대로 두고 이 한 줄만 갈아 끼우면 된다.
 */
const SEEDED_UNLOCKED_IDS: string[] = myUnlockedInterviewReviewsMock.map((entry) => entry.reviewId);

let store: InterviewAccessStore = INITIAL;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return store;
}

/**
 * 서버에서는 언제나 출발점을 돌려준다. 모듈 스코프는 서버 프로세스 안에서 요청끼리 공유되므로
 * `store`를 그대로 내보내면 다른 방문자의 진행 상태가 새어 나갈 수 있다 — 지금은 서버에서
 * 이 값을 바꾸는 경로가 없어 실제로 같은 객체지만, 그 사실에 기대지 않는다.
 * useReviewAccessDemo가 저장소를 "초기 null → 마운트 후 교정"으로 다루는 것과 같은 자리다.
 */
function getServerSnapshot() {
  return INITIAL;
}

function emit(next: InterviewAccessStore) {
  store = next;
  for (const listener of listeners) listener();
}

function creditsFor(userState: InterviewAccessUserState) {
  return userState === "hasCredits" ? reviewAccessMock.remainingPasses : 0;
}

/**
 * 열람 이력은 계정에 딸린 값이라 비로그인에는 주지 않는다 — 그쪽에 시드를 그대로 주면 로그인도 하지 않은
 * 화면이 남의 열람 이력으로 잠금을 풀어 준다. noCredits(로그인했으나 0장)는 반대다: 장수가 바닥난 것과
 * 예전에 읽은 것은 별개라 시드를 그대로 든다. creditsFor가 둘을 함께 0으로 묶는 것과 갈리는 지점이다.
 */
function unlockedFor(userState: InterviewAccessUserState) {
  return userState === "loggedOut" ? EMPTY_IDS : SEEDED_UNLOCKED_IDS;
}

/**
 * 지금 기준(userState)에 맞는 보유 상태. 기준이 다르면 그 기준으로 새로 깐 것을 돌려준다 —
 * 예전 "프리셋이 바뀌면 초기화"를 effect가 아니라 이 한 곳이 진다.
 *
 * 마운트가 아니라 **기준이 실제로 달라졌을 때만** 새로 깔리는 것이 핵심이다. store가 기준까지
 * 함께 기억하므로 화면을 옮겨도 기준이 같으면 진행 상태가 살아남는다.
 */
function baseFor(userState: InterviewAccessUserState): InterviewAccessStore {
  if (store.syncedUserState === userState) return store;
  return { ...store, syncedUserState: userState, credits: creditsFor(userState), unlockedIds: unlockedFor(userState), pendingUnlockId: null };
}

function syncTo(userState: InterviewAccessUserState) {
  const base = baseFor(userState);
  if (base !== store) emit(base);
}

function rememberPreset(preset: InterviewAccessUserState) {
  if (store.preset === preset) return;
  emit({ ...store, preset });
}

function requestUnlock(userState: InterviewAccessUserState, id: string) {
  const base = baseFor(userState);
  if (base === store && base.pendingUnlockId === id) return;
  emit({ ...base, pendingUnlockId: id });
}

function confirmUnlockIn(userState: InterviewAccessUserState) {
  const base = baseFor(userState);
  if (!base.pendingUnlockId) return;
  emit({
    ...base,
    credits: Math.max(base.credits - 1, 0),
    unlockedIds: [...base.unlockedIds, base.pendingUnlockId],
    pendingUnlockId: null,
  });
}

function cancelUnlockIn(userState: InterviewAccessUserState) {
  const base = baseFor(userState);
  if (base === store && base.pendingUnlockId === null) return;
  emit({ ...base, pendingUnlockId: null });
}

export interface InterviewCardAccess {
  /** 잠기지 않은 본문 위에 그리는 보조 라벨. 잠긴 카드에는 없다. */
  accessLabel?: string;
  /** 값이 있으면 CompanyReviewCard가 본문을 잠그고 열람 CTA를 그린다. */
  interviewAccess?: CompanyReviewInterviewAccess;
}

export interface InterviewAccessOptions {
  isLoggedIn: boolean;
  /** noCredits 상태의 CTA("후기 작성하고 열람권 받기")가 이동할 작성 페이지 링크 */
  writeHref: string;
}

export interface InterviewAccess {
  /** 열람권 상태 카드(InterviewAccessStatusCard)가 그대로 받는 표시용 상태 */
  displayState: InterviewAccessUserState;
  credits: number;
  /** 확인 모달을 띄울 후기 id. 그 후기 자체를 찾는 것은 목록을 쥔 호출부의 몫이다. */
  pendingUnlockId: string | null;
  /** 카드 한 장에 넘길 게이팅 props. 잠금 여부·라벨·CTA 상태를 한 번에 계산한다. */
  getAccess: (item: CompanyReviewCardItem) => InterviewCardAccess;
  confirmUnlock: () => void;
  cancelUnlock: () => void;
}

export function useInterviewAccess({ isLoggedIn, writeHref }: InterviewAccessOptions): InterviewAccess {
  const { demoState } = useReviewAccessDemo();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** 패널이 고른 값이 없으면(null) 기존 규칙 그대로 로그인 여부가 프리셋을 정한다. */
  const preset = demoState ?? snapshot.preset;
  const userState: InterviewAccessUserState = preset ?? (isLoggedIn ? "hasCredits" : "loggedOut");

  /**
   * store가 아직 이 기준으로 깔리지 않았으면(첫 마운트·프리셋 전환 직후) 아래 effect가 깔기 전에
   * 이미 "깔린 뒤의 값"을 그린다. effect를 기다리면 그 한 프레임 동안 0장·잠금 없음이 스쳐 간다 —
   * 서버 HTML과도 어긋난다. 계산은 baseFor와 같은 규칙이라 effect가 돌아도 화면이 달라지지 않는다.
   */
  const synced = snapshot.syncedUserState === userState;
  const credits = synced ? snapshot.credits : creditsFor(userState);
  const unlockedIds = synced ? snapshot.unlockedIds : unlockedFor(userState);
  const pendingUnlockId = synced ? snapshot.pendingUnlockId : null;

  const displayState: InterviewAccessUserState = userState === "loggedOut" ? "loggedOut" : credits > 0 ? "hasCredits" : "noCredits";

  /** null은 "아직 모름"이라 덮어쓰지 않는다 — 덮어쓰면 위 preset 구멍 메우기가 무너진다. */
  useEffect(() => {
    if (demoState !== null) rememberPreset(demoState);
  }, [demoState]);

  useEffect(() => {
    syncTo(userState);
  }, [userState]);

  const confirmUnlock = useCallback(() => confirmUnlockIn(userState), [userState]);
  const cancelUnlock = useCallback(() => cancelUnlockIn(userState), [userState]);

  const getAccess = useCallback(
    (item: CompanyReviewCardItem): InterviewCardAccess => {
      const unlocked = unlockedIds.includes(item.id);
      const accessLabel = item.isMine ? "내가 작성한 후기" : unlocked ? "열람 완료 · 추가 차감 없음" : undefined;

      let interviewAccess: CompanyReviewInterviewAccess | undefined;
      if (!item.isMine && !unlocked) {
        interviewAccess = {
          status: displayState === "loggedOut" ? "loggedOut" : displayState === "noCredits" ? "noCredits" : "canUnlock",
          credits,
          writeHref,
          onUnlockRequest: () => requestUnlock(userState, item.id),
        };
      }

      return { accessLabel, interviewAccess };
    },
    [credits, displayState, unlockedIds, userState, writeHref],
  );

  return { displayState, credits, pendingUnlockId, getAccess, confirmUnlock, cancelUnlock };
}
