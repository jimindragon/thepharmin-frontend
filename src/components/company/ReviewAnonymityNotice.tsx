import { Lock } from "lucide-react";

/**
 * 후기 목록 첫 슬롯 카드 두 종(CompanyReviewWriteCard·InterviewAccessStatusCard)이 바닥에 함께 두는 안내.
 *
 * 두 카드가 같은 자리에서 서로를 대체하므로(목록 첫 칸) 이 줄도 한 벌이어야 한다 — 각자 적어 두면
 * 면접 후기 탭과 기업 리뷰 탭에서 익명 보장의 문구가 갈린다.
 *
 * 익명 여부를 쓰기 직전이 아니라 **들어가기 직전에** 말한다. 후기를 쓸지 말지를 정하는 순간이
 * 여기이고, 폼에 들어간 뒤에 알려 주면 이미 결정한 사람에게만 닿는다(폼 안쪽에는 그 자리에서
 * 필요한 다른 안내가 따로 있다 — PHARMACY_REVIEW_PRIVACY_NOTICE).
 */
export function ReviewAnonymityNotice() {
  return (
    <p className="flex items-center justify-center gap-1.5 bg-[#fafafa] px-4 py-3 text-[13px] font-normal leading-[1.5] text-[#6b7280]">
      <Lock size={14} className="shrink-0" aria-hidden />
      작성 내용은 익명으로 공개됩니다.
    </p>
  );
}
