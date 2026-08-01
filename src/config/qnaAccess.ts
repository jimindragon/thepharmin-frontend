import { readPersonalSession } from "@/lib/session.server";

export interface QnaPreviewSearchParams {
  pharmacist?: string;
}

export interface QnaViewerState {
  isLoggedIn: boolean;
  isVerifiedPharmacist: boolean;
}

/**
 * 로그인 여부는 개인 세션 쿠키로만 판정한다. "약사 인증"은 프로젝트에 실제 회원 필드가 없어
 * 여전히 미리보기 쿼리 파라미터로 두며(기본값은 인증, `?pharmacist=false`로 미인증 확인),
 * 로그인 여부와는 별개 축이다.
 *
 * 서버 컴포넌트에서 평가해, 약사 QNA 데이터 자체가 미인증 클라이언트로 내려가지 않도록 한다
 * (클라이언트에서 사후에 가리는 방식이 아님).
 */
export async function resolveQnaViewerState(searchParams: QnaPreviewSearchParams): Promise<QnaViewerState> {
  return {
    isLoggedIn: await readPersonalSession(),
    isVerifiedPharmacist: searchParams.pharmacist !== "false",
  };
}

/** 목록 ↔ 상세 이동 시 미리보기 쿼리 파라미터를 잃지 않도록 현재 상태를 다시 직렬화한다 */
export function buildQnaPreviewQuery(searchParams: QnaPreviewSearchParams): string {
  const query = new URLSearchParams();
  if (searchParams.pharmacist === "false") query.set("pharmacist", "false");
  const value = query.toString();
  return value ? `?${value}` : "";
}
