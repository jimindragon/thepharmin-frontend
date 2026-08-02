import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

export const metadata: Metadata = {
  title: "메일 발송 안내 | 더파마 리크루트",
};

/**
 * 비밀번호 재설정 2/3 — 발송 안내. 입력도 상태도 없어 클라이언트 컴포넌트로 만들지 않는다.
 *
 * "가입된 계정이 있는 경우"는 의도된 표현이다 — 계정 존재 여부가 드러나지 않게 하는 장치라
 * 자연스럽게 다듬지 말 것.
 *
 * 목데이터 단계라 메일을 보낼 수 없어 이 화면에서 3/3(/login/reset/new)으로 가는 수단은 없다.
 */
export default function PasswordResetSentPage() {
  return (
    <>
      <AuthHeader />
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
        <div className="mx-auto max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
          <Eyebrow>비밀번호 찾기</Eyebrow>
          <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">메일을 확인해 주세요</h1>
          <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            가입된 계정이 있는 경우, 비밀번호 재설정 메일을 보내드립니다.
            <br />
            메일이 보이지 않으면 스팸함을 확인해 주세요.
          </p>
          <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            링크는 발송 후 30분 동안 사용할 수 있습니다.
          </p>

          <div className="mt-7">
            <LinkButton href="/login" variant="primary" className="w-full">
              로그인으로 돌아가기
            </LinkButton>
          </div>

          <div className="mt-8 border-t border-border" />
          <p className="mt-5 text-center text-[13px] text-[#68717e]">
            <Link href="/login/reset" className="font-medium text-[#111111] underline underline-offset-2">
              메일을 다시 받기
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
