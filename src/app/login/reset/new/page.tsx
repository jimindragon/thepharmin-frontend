import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { PasswordResetNewClient } from "@/components/login/PasswordResetNewClient";

export const metadata: Metadata = {
  title: "새 비밀번호 설정 | 더파마 리크루트",
};

/**
 * 메일의 재설정 링크가 도착하는 화면. 목데이터 단계라 토큰 검증이 없어 URL 직접 접근으로 확인한다.
 *
 * 링크 만료 화면은 만료를 판정할 수단(토큰)이 없어 이번에 만들지 않았다. 확정 카피만 기록해 둔다:
 *   제목: 링크가 만료되었습니다
 *   본문: 보안을 위해 재설정 링크는 30분 동안만 사용할 수 있습니다. 다시 요청해 주세요.
 *   버튼: 재설정 메일 다시 받기
 */
export default function PasswordResetNewPage() {
  return (
    <>
      <AuthHeader />
      <PasswordResetNewClient />
    </>
  );
}
