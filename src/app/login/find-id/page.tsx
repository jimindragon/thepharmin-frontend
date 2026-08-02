import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { FindIdClient } from "@/components/login/FindIdClient";

export const metadata: Metadata = {
  title: "아이디 찾기 | 더파마 리크루트",
};

/**
 * 아이디 찾기. 비밀번호 재설정(/login/reset)과 달리 결과를 하위 라우트로 두지 않는다 —
 * 이유는 FindIdClient 주석 참고.
 */
export default function FindIdPage() {
  return (
    <>
      <AuthHeader />
      <FindIdClient />
    </>
  );
}
