"use client";

import { useCallback, useEffect, useState } from "react";
import type { CompanyReviewCardItem, CompanyReviewInterviewAccess } from "@/components/company/CompanyReviewCard";
import type { InterviewAccessUserState } from "@/components/company/InterviewAccessStatusCard";
import { reviewAccessMock } from "@/data/companies";
import { useReviewAccessDemo } from "@/hooks/useReviewAccessDemo";

/**
 * 면접 후기 열람권(credit) 데모의 상태기계. 실제 저장/인증은 없는 클라이언트 전용 목업이다.
 *
 * 종전에는 면접 후기 목록(CompanyInterviewsListClient)이 이 상태를 직접 들고 있었다. 훅으로 뺀 것은
 * 열람권을 쓰는 화면이 목록 하나가 아니게 되기 때문이다 — 기업 개요가 면접 후기를 인라인으로 펼치면
 * 같은 상태기계가 두 곳에서 돌아야 하고, 나중에 실제 저장 파이프라인을 붙일 때 갈아끼울 자리도
 * 이 파일 하나여야 한다.
 *
 * DEV 프리셋(useReviewAccessDemo)은 이 훅이 안에서 직접 부른다 — 호출부는 isLoggedIn만 넘긴다.
 * 프리셋 파생("어느 상태를 보고 싶은가")을 호출부마다 적어 두면 화면끼리 초기 상태가 갈린다.
 * userState는 그 프리셋(패널이 고른 값이 없으면 로그인 여부)이고, credits는 열람에 따라 실시간으로
 * 줄어든다. 카드별 잠금 판정은 userState가 loggedOut이 아닌 한 credits(0 여부)로 계산해
 * "열람 중 0장 도달" 전환을 자연스럽게 반영한다.
 */

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
  /** 패널이 고른 값이 없으면(null) 기존 규칙 그대로 로그인 여부가 프리셋을 정한다. */
  const { demoState } = useReviewAccessDemo();
  const userState: InterviewAccessUserState = demoState ?? (isLoggedIn ? "hasCredits" : "loggedOut");

  const [credits, setCredits] = useState(isLoggedIn ? reviewAccessMock.remainingPasses : 0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [pendingUnlockId, setPendingUnlockId] = useState<string | null>(null);

  const displayState: InterviewAccessUserState = userState === "loggedOut" ? "loggedOut" : credits > 0 ? "hasCredits" : "noCredits";

  /**
   * 프리셋이 바뀌면 진행 상태를 되돌린다 — 예전 handleDemoChange가 하던 초기화 그대로다.
   * 전환이 이 훅 밖(DEV 패널)에서 일어나므로 클릭 핸들러가 아니라 값의 변화를 보고 실행한다.
   * 마운트 시에도 한 번 도는데, 그때는 useState 초기값과 같은 값을 다시 넣어 화면이 달라지지 않는다.
   */
  useEffect(() => {
    setCredits(userState === "hasCredits" ? reviewAccessMock.remainingPasses : 0);
    setUnlockedIds([]);
    setPendingUnlockId(null);
  }, [userState]);

  const confirmUnlock = useCallback(() => {
    if (!pendingUnlockId) return;
    setCredits((prev) => Math.max(prev - 1, 0));
    setUnlockedIds((prev) => [...prev, pendingUnlockId]);
    setPendingUnlockId(null);
  }, [pendingUnlockId]);

  const cancelUnlock = useCallback(() => setPendingUnlockId(null), []);

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
          onUnlockRequest: () => setPendingUnlockId(item.id),
        };
      }

      return { accessLabel, interviewAccess };
    },
    [credits, displayState, unlockedIds, writeHref],
  );

  return { displayState, credits, pendingUnlockId, getAccess, confirmUnlock, cancelUnlock };
}
