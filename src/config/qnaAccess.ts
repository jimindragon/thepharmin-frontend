export interface QnaPreviewSearchParams {
  guest?: string;
  pharmacist?: string;
}

export interface QnaViewerState {
  isLoggedIn: boolean;
  isVerifiedPharmacist: boolean;
}

/**
 * 채용 QNA 전용 미리보기 쿼리 파라미터. 프로젝트에는 "약사 인증" 여부를 나타내는 실제
 * 회원 필드가 없어, usePersonalLoginState의 `?guest=true` 패턴과 동일한 방식으로 둔다 —
 * 기본값은 가장 넓은 권한(로그인 + 약사 인증)이고 `?pharmacist=false`로 미인증 상태를
 * 미리 본다. 서버 컴포넌트에서 평가해, 약사 QNA 데이터 자체가 미인증 클라이언트로
 * 내려가지 않도록 한다(클라이언트에서 사후에 가리는 방식이 아님).
 */
export function resolveQnaViewerState(searchParams: QnaPreviewSearchParams): QnaViewerState {
  return {
    isLoggedIn: searchParams.guest !== "true",
    isVerifiedPharmacist: searchParams.pharmacist !== "false",
  };
}

/** 목록 ↔ 상세 이동 시 미리보기 쿼리 파라미터를 잃지 않도록 현재 상태를 다시 직렬화한다 */
export function buildQnaPreviewQuery(searchParams: QnaPreviewSearchParams): string {
  const query = new URLSearchParams();
  if (searchParams.guest === "true") query.set("guest", "true");
  if (searchParams.pharmacist === "false") query.set("pharmacist", "false");
  const value = query.toString();
  return value ? `?${value}` : "";
}
