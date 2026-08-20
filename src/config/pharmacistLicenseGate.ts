import type { QnaViewerState } from "@/config/qnaAccess";

/**
 * 약사 면허 인증 게이트가 공유하는 문구·이동처와, 그 인증 상태를 "약국 재직 후기를 쓸 수 있는가"로
 * 옮긴 값.
 *
 * 인증 상태 축은 약사 QNA가 이미 들고 있는 것을 그대로 쓴다(qnaAccess.ts의 QnaViewerState) —
 * 로그인 여부 · 인증 여부 · 면허 등록 자격 세 값이고, 여기서 새로 만드는 축은 없다.
 * 아래 함수는 그 세 값의 조합에 이름을 붙일 뿐이라, 실 서버에서 회원 필드가 생겨 판정이 그리로
 * 옮겨 가면 이 파일이 따라 고칠 것은 없다.
 *
 * 세션을 읽는 resolveQnaViewerState는 qnaAccess에 그대로 둔다 — 그쪽은 next/headers를 끌고 있고
 * 이 파일은 작성 유도 카드(클라이언트 컴포넌트)가 함께 읽어야 해서 순수 값만 담는다.
 * QnaViewerState를 `import type`으로만 가져오는 것도 같은 이유다(컴파일에서 지워진다).
 *
 * 재직 인증(이 약국에서 실제로 일했는지)은 이번 게이트에 포함하지 않는다 — 확인 방법이 아직
 * 정해지지 않았다. **재직 인증은 정책 확정 후 추가될 자리**이고, 그때는 약사 인증 축 옆에
 * 나란히 서는 두 번째 조건이 된다(약사 인증을 대체하지 않는다).
 */

/** 회원정보 §4 "약사 인증" 섹션 앵커. 약사 QNA 안내 창과 이 게이트가 같은 곳으로 보낸다. */
export const PHARMACIST_LICENSE_REGISTER_HREF = "/mypage/account#license";

/** 면허 등록 동선의 CTA 문구. 두 게이트가 같은 말을 쓰도록 여기 한 벌만 둔다. */
export const PHARMACIST_LICENSE_CTA = "면허 등록하러 가기";

/**
 * 약국 재직 후기를 쓸 수 있는지. 네 값은 위 세 boolean의 조합에 붙인 이름이고 별도의 저장소가 없다.
 *
 * - allowed      인증된 약사 — 종전대로 폼으로 들어간다
 * - needsLogin   비로그인 — 로그인 안내
 * - needsLicense 미인증이지만 면허를 등록하면 인증받을 수 있는 회원 — 인증 안내
 * - notEligible  약사 자격과 무관한 회원 — 안내도 권유도 하지 않는다
 */
export type PharmacyReviewWriteAccess = "allowed" | "needsLogin" | "needsLicense" | "notEligible";

/**
 * 로그인 여부를 가장 먼저 본다. 비로그인은 인증 상태를 말할 수 있는 자리가 아니고
 * (미리보기 쿼리가 없으면 인증으로 판정되는 축이라 더욱 그렇다), 해야 할 일도 로그인 하나뿐이다.
 */
export function getPharmacyReviewWriteAccess({
  isLoggedIn,
  isVerifiedPharmacist,
  canRegisterLicense,
}: QnaViewerState): PharmacyReviewWriteAccess {
  if (!isLoggedIn) return "needsLogin";
  if (isVerifiedPharmacist) return "allowed";
  return canRegisterLicense ? "needsLicense" : "notEligible";
}

/** 작성 CTA를 아예 보여주지 않는 상태 — 약사 자격과 무관한 회원에게 면허 등록을 권하지 않는다는 뜻이다. */
export function hidesPharmacyReviewWriteCta(access: PharmacyReviewWriteAccess): boolean {
  return access === "notEligible";
}

/**
 * 인증 안내 문구. 약사 QNA 안내 창(PharmacistLicenseNoticeModal)의 두 줄과 같은 톤이다 —
 * 무엇이 막혔는지 한 줄, 무엇을 하면 풀리는지 한 줄.
 */
export const PHARMACY_REVIEW_WRITE_GATE_PRIMARY = "약국 재직 후기는 약사 인증 후 작성할 수 있습니다.";
export const PHARMACY_REVIEW_WRITE_GATE_SECONDARY = "면허를 등록하시면 확인 후 작성 가능합니다.";

/** 비로그인 갈래. 작성 유도 카드가 로그인 전에 쓰는 문구·이동처와 같은 자리다. */
export const PHARMACY_REVIEW_WRITE_GATE_LOGIN_PRIMARY = "로그인 후 작성할 수 있습니다.";
export const PHARMACY_REVIEW_WRITE_GATE_LOGIN_CTA = "로그인하기";
export const PHARMACY_REVIEW_WRITE_GATE_LOGIN_HREF = "/companies";
