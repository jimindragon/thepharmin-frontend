"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { FLUSH_GRID_CLASS } from "@/components/flushListStyles";
import { CompanyReviewCard, type CompanyReviewCardItem, type CompanyReviewInterviewAccess } from "@/components/company/CompanyReviewCard";
import { InterviewAccessStatusCard, type InterviewAccessUserState } from "@/components/company/InterviewAccessStatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { reviewAccessMock } from "@/data/companies";
import { useReviewAccessDemo } from "@/hooks/useReviewAccessDemo";

interface CompanyInterviewsListClientProps {
  companyId: string;
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
}

/** 열람권(credit) 데모 상태를 이 컴포넌트가 관리한다 — 실제 저장/인증은 없는 클라이언트 전용 목업이다.
 * userState는 프리셋(이제 DEV 패널이 useReviewAccessDemo로 고른다)이고, credits는 열람에 따라 실시간으로
 * 줄어든다. 카드별 잠금 판정은 userState가 loggedOut이 아닌 한 credits(0 여부)로 계산해 "열람 중 0장 도달"
 * 전환(STEP 10)을 자연스럽게 반영한다. */
export function CompanyInterviewsListClient({ companyId, items, isLoggedIn }: CompanyInterviewsListClientProps) {
  const writeHref = `/companies/${companyId}/interviews/new`;

  /** 패널이 고른 값이 없으면(null) 기존 규칙 그대로 로그인 여부가 프리셋을 정한다. */
  const { demoState } = useReviewAccessDemo();
  const userState: InterviewAccessUserState = demoState ?? (isLoggedIn ? "hasCredits" : "loggedOut");

  const [credits, setCredits] = useState(isLoggedIn ? reviewAccessMock.remainingPasses : 0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [pendingUnlockId, setPendingUnlockId] = useState<string | null>(null);

  const displayState: InterviewAccessUserState = userState === "loggedOut" ? "loggedOut" : credits > 0 ? "hasCredits" : "noCredits";

  /**
   * 프리셋이 바뀌면 진행 상태를 되돌린다 — 예전 handleDemoChange가 하던 초기화 그대로다.
   * 이제 전환이 이 컴포넌트 밖(DEV 패널)에서 일어나므로 클릭 핸들러가 아니라 값의 변화를 보고 실행한다.
   * 마운트 시에도 한 번 도는데, 그때는 useState 초기값과 같은 값을 다시 넣어 화면이 달라지지 않는다.
   */
  useEffect(() => {
    setCredits(userState === "hasCredits" ? reviewAccessMock.remainingPasses : 0);
    setUnlockedIds([]);
    setPendingUnlockId(null);
  }, [userState]);

  const handleConfirmUnlock = () => {
    if (!pendingUnlockId) return;
    setCredits((prev) => Math.max(prev - 1, 0));
    setUnlockedIds((prev) => [...prev, pendingUnlockId]);
    setPendingUnlockId(null);
  };

  const pendingItem = items.find((item) => item.id === pendingUnlockId);

  return (
    <div>
      {/* ≤760px 전폭 낱장 목록 — 기업 리뷰 탭과 같은 한 줄이다(FLUSH_GRID_CLASS + border-y).
          잠금 카드(LockedContent)와 열람권 상태 카드의 내부 렌더는 건드리지 않는다: 바뀌는 것은
          그것들을 담는 목록의 폭과 카드 좌우 여백뿐이다. */}
      <div
        className={clsx(
          "grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1",
          FLUSH_GRID_CLASS,
          "max-[760px]:border-y max-[760px]:border-border",
        )}
      >
        <InterviewAccessStatusCard userState={displayState} credits={credits} writeHref={writeHref} />
        {items.map((item) => {
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

          return <CompanyReviewCard key={item.id} review={item} accessLabel={accessLabel} interviewAccess={interviewAccess} />;
        })}
      </div>

      {/* 열람권 1장 사용 확인. 파괴적 동작이 아니라 tone="info"(회색 잠금 아이콘 + 검정 확인 버튼)를 쓴다 */}
      {pendingItem ? (
        <ConfirmDialog
          ariaLabel="면접 후기 열람 확인"
          title="면접 후기를 열람할까요?"
          description={
            <>
              열람권 1장이 사용됩니다.
              <br />
              열람 후에는 추가 차감 없이 다시 볼 수 있어요.
            </>
          }
          descriptionSize="md"
          note={`보유 ${credits}장 → ${Math.max(credits - 1, 0)}장`}
          tone="info"
          confirmLabel="열람하기"
          onConfirm={handleConfirmUnlock}
          onCancel={() => setPendingUnlockId(null)}
        />
      ) : null}
    </div>
  );
}
