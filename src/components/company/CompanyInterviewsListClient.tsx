"use client";

import { useState } from "react";
import clsx from "clsx";
import { CompanyReviewCard, type CompanyReviewCardItem, type CompanyReviewInterviewAccess } from "@/components/company/CompanyReviewCard";
import { InterviewAccessStatusCard, type InterviewAccessUserState } from "@/components/company/InterviewAccessStatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { reviewAccessMock } from "@/data/companies";

interface CompanyInterviewsListClientProps {
  companyId: string;
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
}

const DEMO_OPTIONS: { value: InterviewAccessUserState; label: string }[] = [
  { value: "loggedOut", label: "비로그인" },
  { value: "noCredits", label: "열람권 0장" },
  { value: "hasCredits", label: "열람권 2장" },
];

/** 열람권(credit) 데모 상태를 이 컴포넌트가 관리한다 — 실제 저장/인증은 없는 클라이언트 전용 목업이다.
 * userState는 데모 토글이 선택한 프리셋이고, credits는 열람에 따라 실시간으로 줄어든다. 카드별 잠금 판정은
 * userState가 loggedOut이 아닌 한 credits(0 여부)로 계산해 "열람 중 0장 도달" 전환(STEP 10)을 자연스럽게 반영한다. */
export function CompanyInterviewsListClient({ companyId, items, isLoggedIn }: CompanyInterviewsListClientProps) {
  const writeHref = `/companies/${companyId}/interviews/new`;

  const [userState, setUserState] = useState<InterviewAccessUserState>(isLoggedIn ? "hasCredits" : "loggedOut");
  const [credits, setCredits] = useState(isLoggedIn ? reviewAccessMock.remainingPasses : 0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [pendingUnlockId, setPendingUnlockId] = useState<string | null>(null);

  const displayState: InterviewAccessUserState = userState === "loggedOut" ? "loggedOut" : credits > 0 ? "hasCredits" : "noCredits";

  const handleDemoChange = (next: InterviewAccessUserState) => {
    setUserState(next);
    setCredits(next === "hasCredits" ? reviewAccessMock.remainingPasses : 0);
    setUnlockedIds([]);
    setPendingUnlockId(null);
  };

  const handleConfirmUnlock = () => {
    if (!pendingUnlockId) return;
    setCredits((prev) => Math.max(prev - 1, 0));
    setUnlockedIds((prev) => [...prev, pendingUnlockId]);
    setPendingUnlockId(null);
  };

  const pendingItem = items.find((item) => item.id === pendingUnlockId);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 border border-dashed border-[#c7cdd6] bg-[#fafbfc] px-3 py-2">
        <span className="text-[12px] font-medium text-[#9aa3af]">데모: 상태 전환</span>
        <div className="flex items-center gap-1.5">
          {DEMO_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDemoChange(option.value)}
              aria-pressed={userState === option.value}
              className={clsx(
                "h-7 border border-dashed px-2 text-[12px] font-medium transition",
                userState === option.value ? "border-[#111111] text-[#111111]" : "border-[#c7cdd6] text-[#8a95a5] hover:border-[#8a95a5]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
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
