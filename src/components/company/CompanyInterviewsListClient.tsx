"use client";

import clsx from "clsx";
import { FLUSH_GRID_CLASS } from "@/components/flushListStyles";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";
import { InterviewAccessStatusCard } from "@/components/company/InterviewAccessStatusCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInterviewAccess } from "@/hooks/useInterviewAccess";

interface CompanyInterviewsListClientProps {
  companyId: string;
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
  /**
   * ≤760px 목록 위아래에 1px 경계를 그을지. 기본값(true)은 면접 후기 탭처럼 이 목록이 화면 본문의
   * 전부인 자리다 — 감싸는 셸이 없어 이 선이 없으면 흰 블록이 회색 배경으로 번진다.
   * 기업 개요의 인라인 펼침처럼 섹션 카드(SectionShell) 안에 들어갈 때는 false로 끈다:
   * 흰 블록의 시작·끝은 섹션이 이미 확정하고, 선이 겹치면 목록이 섹션 안의 또 다른 액자로 읽힌다.
   * 관련 뉴스 탭이 섹션 안에서 같은 목록(FLUSH_GRID_CLASS)을 쓰며 border-y만 빼는 것과 같은 자리다.
   */
  framed?: boolean;
}

/** 열람권(credit) 데모 상태는 useInterviewAccess가 관리한다 — 이 컴포넌트는 그 값을 목록에 배선하기만 한다.
 * 확인 모달을 띄울 후기 자체를 찾는 일(pendingItem)만 여기 남는다: 목록을 쥐고 있는 것이 이쪽이다.
 *
 * 면접 후기 탭(/companies/{id}/interviews)과 기업 개요 ≤760px 인라인 펼침이 이 컴포넌트를 함께 쓴다 —
 * 열람권 상태 카드·카드별 게이팅·확인 모달이 한 덩어리라, 개요 쪽에서 그 셋을 따로 조립하면 두 화면의
 * 게이팅 규칙이 갈린다. 보유 장수는 useInterviewAccess가 화면 밖(모듈 store)에 두므로 두 곳을 오가도
 * 이어진다. 두 화면의 차이는 아래 framed 한 줄뿐이다. */
export function CompanyInterviewsListClient({ companyId, items, isLoggedIn, framed = true }: CompanyInterviewsListClientProps) {
  const writeHref = `/companies/${companyId}/interviews/new`;

  const { displayState, credits, pendingUnlockId, getAccess, confirmUnlock, cancelUnlock } = useInterviewAccess({
    isLoggedIn,
    writeHref,
  });

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
          framed && "max-[760px]:border-y max-[760px]:border-border",
        )}
      >
        <InterviewAccessStatusCard userState={displayState} credits={credits} writeHref={writeHref} />
        {items.map((item) => {
          const { accessLabel, interviewAccess } = getAccess(item);
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
          onConfirm={confirmUnlock}
          onCancel={cancelUnlock}
        />
      ) : null}
    </div>
  );
}
