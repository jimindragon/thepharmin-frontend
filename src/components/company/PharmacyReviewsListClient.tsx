"use client";

import clsx from "clsx";
import { FLUSH_GRID_CLASS } from "@/components/flushListStyles";
import { CompanyReviewCard, type CompanyReviewCardItem } from "@/components/company/CompanyReviewCard";
import { CompanyReviewWriteCard } from "@/components/company/CompanyReviewWriteCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInterviewAccess } from "@/hooks/useInterviewAccess";

interface PharmacyReviewsListClientProps {
  companyId: string;
  items: CompanyReviewCardItem[];
  isLoggedIn: boolean;
  /** ≤760px 목록 위아래 1px 경계. 기준은 면접 후기 목록과 같다 — 섹션 카드 안에 들어갈 때만 끈다. */
  framed?: boolean;
}

/**
 * 약국 재직 후기 목록. 기업 리뷰 탭(/companies/{id}/reviews)과 개요 ≤760px 인라인 펼침이 함께 쓴다.
 *
 * 다른 세 트랙의 재직 후기는 서버가 그린 정적 격자 그대로다 — 잠글 것이 없어 클라이언트가 필요 없다.
 * 약국만 이 컴포넌트를 타는 이유는 열람권 게이팅이 클라이언트 상태기계이기 때문이고, 그 상태기계는
 * 면접 후기가 쓰던 것(useInterviewAccess)을 **그대로** 재사용한다.
 *
 * 열람권을 새로 만들지 않고 나눠 쓰는 것이 핵심이다. 지갑이 둘이면 "가입 시 2장"이 실제로는 4장이 되고,
 * 면접 후기에서 쓴 장수가 재직 후기에서 되살아난다. 그 store는 모듈 스코프라 화면을 옮겨도 이어지므로,
 * 같은 훅을 부르는 것만으로 두 후기 종류가 한 지갑을 본다.
 *
 * 확인 모달을 띄울 후기를 찾는 일(pendingItem)만 여기 남는다 — 목록을 쥔 쪽이 이쪽이다. 면접 후기
 * 목록도 같은 pendingUnlockId를 보지만 후기 id가 서로 겹치지 않아, 두 목록이 함께 떠 있는 개요에서도
 * 자기 것이 아닌 모달은 열리지 않는다.
 *
 * 첫 슬롯은 종전대로 작성 유도 카드다(면접 후기 쪽 열람권 상태 카드가 아니다) — 그 카드의 문구·CTA가
 * "면접 후기 작성하기"로 박혀 있어 이 자리에 세울 수 없고, 보유 장수는 잠긴 카드의 CTA가 말해 준다.
 */
export function PharmacyReviewsListClient({ companyId, items, isLoggedIn, framed = true }: PharmacyReviewsListClientProps) {
  /** 지급 대상이 면접 후기만이 아니게 됐으므로, 잠금 CTA는 이 약국의 재직 후기 작성 폼으로 보낸다 */
  const writeHref = `/companies/${companyId}/reviews/new`;

  const { credits, pendingUnlockId, getAccess, confirmUnlock, cancelUnlock } = useInterviewAccess({ isLoggedIn, writeHref });

  const pendingItem = items.find((item) => item.id === pendingUnlockId);

  return (
    <div>
      <div
        className={clsx(
          "grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1",
          FLUSH_GRID_CLASS,
          framed && "max-[760px]:border-y max-[760px]:border-border",
        )}
      >
        <CompanyReviewWriteCard companyId={companyId} reviewType="company" isLoggedIn={isLoggedIn} hasItems={items.length > 0} />
        {items.map((item) => {
          const { accessLabel, interviewAccess } = getAccess(item);
          return <CompanyReviewCard key={item.id} review={item} accessLabel={accessLabel} interviewAccess={interviewAccess} />;
        })}
      </div>

      {/* 열람권 1장 사용 확인. 면접 후기 모달과 같은 구성·같은 tone이고 후기 종류를 가리키는 말만 다르다 */}
      {pendingItem ? (
        <ConfirmDialog
          ariaLabel="재직 후기 열람 확인"
          title="재직 후기를 열람할까요?"
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
