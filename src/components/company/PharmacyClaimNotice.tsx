"use client";

import { NoticeRow } from "@/components/ui/NoticeRow";
import type { PharmacyClaimStatus } from "@/data/pharmacyDetail";
import { usePharmacyClaimRequest } from "@/hooks/usePharmacyClaimRequests";

/**
 * 약국 상세 본문 맨 아래 안내 행. 아직 주인이 없는 약국에만 선다.
 *
 * 클라이언트 컴포넌트인 것은 신청 여부가 브라우저 저장소에 있어서다(usePharmacyClaimRequests).
 * 서버는 그 값을 알 수 없으므로 첫 페인트에는 아무 문구도 세우지 않는다 — 기본값을 "신청 없음"으로
 * 두면 이미 신청한 사람에게 "약국 인증하기" 버튼이 한 프레임 떴다가 사라지고, 그 사이에 누르면
 * 이미 낸 신청을 다시 내러 가게 된다. 그래서 로딩 동안은 같은 크기의 빈 자리만 잡는다:
 * 버튼이 없으니 누를 수 없고, 높이가 같으니 문구가 들어와도 아래가 밀리지 않는다.
 */

const CLAIM_PROMPT = "이 약국의 약국장이신가요?";
const CLAIM_CTA = "약국 인증하기";
const REVIEWING_NOTICE = "약국 인증 신청이 접수되어 검토 중입니다.";

export function PharmacyClaimNotice({ registryId, claimStatus }: { registryId: string; claimStatus: PharmacyClaimStatus }) {
  const { state } = usePharmacyClaimRequest(registryId);

  /** 주인이 있는 약국에는 물어볼 것이 없다 */
  if (claimStatus === "claimed") return null;

  if (state === "loading") {
    /* 자리를 정확히 맞추는 가장 확실한 방법은 들어올 행을 그대로 두고 안 보이게 하는 것이다 —
       높이를 숫자로 베끼면 폭이 좁아져 문구가 두 줄로 접히는 순간 어긋난다.
       visibility:hidden이라 누를 수도, 스크린리더가 읽을 수도 없다(aria-hidden으로 한 번 더 막는다). */
    return (
      <div aria-hidden className="invisible">
        <NoticeRow text={CLAIM_PROMPT} actionLabel={CLAIM_CTA} actionHref="#" />
      </div>
    );
  }

  if (state === "pending") {
    return <NoticeRow text={REVIEWING_NOTICE} />;
  }

  return <NoticeRow text={CLAIM_PROMPT} actionLabel={CLAIM_CTA} actionHref={`/business/signup/pharmacy?pharmacyId=${registryId}`} />;
}
