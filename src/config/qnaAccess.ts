import { readPersonalSession } from "@/lib/session.server";

export interface QnaPreviewSearchParams {
  pharmacist?: string;
  licenseEligible?: string;
}

export interface QnaViewerState {
  isLoggedIn: boolean;
  isVerifiedPharmacist: boolean;
  /** 면허를 등록하면 약사 인증을 받을 수 있는 회원인지 — 미인증 안내를 보여줄지 가르는 값 */
  canRegisterLicense: boolean;
}

/**
 * 약사 QNA 상세에서 되돌려보냈다는 표식. 목록 화면이 이 값을 안내 문구로 바꿔 보여준다.
 * 미리보기 쿼리(buildQnaPreviewQuery)에는 싣지 않는다 — 한 번 알리고 끝나는 값이라
 * 상태처럼 따라다니면 이후 이동에서도 계속 안내가 뜬다.
 */
export const QNA_REDIRECT_REASON_PHARMACIST_ONLY = "pharmacist-only";

/**
 * 로그인 여부는 개인 세션 쿠키로만 판정한다. "약사 인증"은 프로젝트에 실제 회원 필드가 없어
 * 여전히 미리보기 쿼리 파라미터로 두며(기본값은 인증, `?pharmacist=false`로 미인증 확인),
 * 로그인 여부와는 별개 축이다.
 *
 * `canRegisterLicense`는 "미인증"과 또 다른 축이다. 실 서버에서는 회원의 소속·직무·학년으로
 * 판정한다(면허 칸이 뜨는 소속 = memberAffiliation.ts의 licenseMode auto/checkbox 소속 +
 * 약대 6학년). 목업에서는 쿼리로 세 상태를 재현한다:
 *   (기본)                          — 인증 완료
 *   ?pharmacist=false               — 미인증 + 면허 등록 자격 있음(안내를 보여줄 대상)
 *   ?pharmacist=false&licenseEligible=false — 미인증 + 자격 무관(안내를 보여주지 않는다)
 * 약사 자격과 무관한 회원에게 "면허를 등록하세요"는 안내가 아니라 잘못된 권유가 된다.
 *
 * 서버 컴포넌트에서 평가해, 약사 QNA 데이터 자체가 미인증 클라이언트로 내려가지 않도록 한다
 * (클라이언트에서 사후에 가리는 방식이 아님).
 */
export async function resolveQnaViewerState(searchParams: QnaPreviewSearchParams): Promise<QnaViewerState> {
  const isVerifiedPharmacist = searchParams.pharmacist !== "false";

  return {
    isLoggedIn: await readPersonalSession(),
    isVerifiedPharmacist,
    // 이미 인증된 회원에게는 등록 안내가 나올 일이 없어 미인증일 때만 참이 된다.
    canRegisterLicense: !isVerifiedPharmacist && searchParams.licenseEligible !== "false",
  };
}

/** 목록 ↔ 상세 이동 시 미리보기 쿼리 파라미터를 잃지 않도록 현재 상태를 다시 직렬화한다 */
export function buildQnaPreviewQuery(searchParams: QnaPreviewSearchParams): string {
  const query = new URLSearchParams();
  if (searchParams.pharmacist === "false") query.set("pharmacist", "false");
  // 이 값이 빠지면 상세에서 목록으로 돌아올 때 "자격 무관" 상태가 풀려 안내가 뜬다.
  if (searchParams.licenseEligible === "false") query.set("licenseEligible", "false");
  const value = query.toString();
  return value ? `?${value}` : "";
}
