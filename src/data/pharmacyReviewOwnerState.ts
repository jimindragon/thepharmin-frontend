/**
 * 약국 계정이 자기 약국 재직 후기에 대해 한 일. 후기 원본(companies.ts)과 **분리해서** 둔다.
 *
 * 신고·재검토는 후기의 성질이 아니라 약국이 취한 조치다. 후기 데이터에 얹어 두면 구직자 화면이
 * 읽는 객체에 그 사실이 함께 실려, "신고당한 후기"가 그쪽에 드러난다 — 신고 접수는 아직 아무것도
 * 판정되지 않은 상태라, 읽는 사람에게는 후기를 의심할 근거가 아니라 소음이다.
 *
 * 공식 답변만 성격이 다르다. 그것은 애초에 공개를 전제로 쓰는 글이라 구직자 화면에도 나간다 —
 * 그래서 이 파일에서 그 하나만 따로 꺼내 주는 통로(getPharmacyOfficialReply)를 두고, 신고·재검토는
 * 기업센터 화면만 Record 전체를 읽는다.
 *
 * 실제 저장은 없다. 기업센터 화면이 이 초기값을 로컬 state로 복사해 쓰고, 새로고침하면 되돌아간다.
 */

/** 기업센터 "후기 관리"가 다루는 약국. 데모 계정이 이 약국 하나라 목록도 이 id로 고른다. */
export const OWNER_PHARMACY_ID = "thepharma-pharmacy";

export interface PharmacyReviewOfficialReply {
  content: string;
  writtenAt: string;
}

/**
 * 신고와 재검토는 **각각 다른 필드**다. 한 후기에 동시에 있을 수 있어서다 —
 * 운영정책 위반으로 신고해 두고, 그와 별개로 사실관계 재검토를 신청하는 경우가 실제로 생긴다.
 * 하나의 상태 유니온으로 합치면 둘 중 나중 것이 앞의 것을 덮어 쓴다.
 */
export interface PharmacyReviewOwnerState {
  reportStatus?: "none" | "submitted";
  recheckStatus?: "none" | "inProgress";
  officialReply?: PharmacyReviewOfficialReply;
}

/** 후기 id → 약국장 측 상태. 값이 없는 후기는 아무 조치도 하지 않은 상태다. */
export const initialPharmacyReviewOwnerState: Record<string, PharmacyReviewOwnerState> = {
  "review-company-thepharma-1": {
    officialReply: {
      content:
        "점심시간이 밀린다는 의견 감사합니다. 교대 시간을 나누어 점심시간을 고정으로 배정하는 방식으로 바꾸고 있습니다. 근무 중 불편한 점은 언제든 말씀해 주세요.",
      writtenAt: "2026.07",
    },
  },
  "review-company-thepharma-3": {
    reportStatus: "submitted",
  },
};

/**
 * 구직자 화면이 읽는 유일한 값. Record 전체를 넘기지 않는 것이 이 함수의 존재 이유다 —
 * 넘기면 신고·재검토까지 그쪽 매핑의 손이 닿는 곳에 놓인다.
 *
 * 기업센터에서 방금 쓴 답변은 여기 반영되지 않는다(저장이 없어 로컬 state에만 있다).
 */
export function getPharmacyOfficialReply(reviewId: string): PharmacyReviewOfficialReply | undefined {
  return initialPharmacyReviewOwnerState[reviewId]?.officialReply;
}
