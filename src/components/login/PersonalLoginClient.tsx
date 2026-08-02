"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { SocialLoginButtons } from "@/components/shared/SocialLoginButtons";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";

/**
 * TextInput이 type prop을 받지 않아 비밀번호는 생 input을 쓴다.
 * 가입 폼에도 같은 값의 상수가 있지만 일부러 공유하지 않는다 — 로그인 화면이 가입 폼에 묶이지 않게 한다.
 */
const RAW_INPUT =
  "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal leading-tight text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

export function PersonalLoginClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { login } = usePersonalLoginState();
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const canSubmit = Boolean(accountId.trim()) && password.trim() !== "";

  // 기업 로그인(BusinessLoginClient)과 같은 형태 — 자격 검증 없이 세션 쿠키만 쓰고 이동한다.
  const handleLogin = () => {
    login();
    router.push(redirectTo);
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
        <Eyebrow>개인회원 로그인</Eyebrow>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">로그인</h1>
        <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
          더파마뉴스와 더파마 리크루트를 하나의 계정으로 이용하실 수 있습니다.
        </p>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <FieldLabel required>아이디</FieldLabel>
            <TextInput value={accountId} onChange={setAccountId} placeholder="아이디를 입력해 주세요" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>비밀번호</FieldLabel>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={RAW_INPUT}
            />
          </div>
        </div>

        {/* 링크가 둘로 늘면서 390px에서 한 줄에 다 들어가지 않는다. 좁아지면 링크 줄만 아래로 내린다
            — 그러지 않으면 "로그인 상태 유지"가 두 줄로 접힌다. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
          <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-[#4f5967]">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(event) => setKeepSignedIn(event.target.checked)}
              className="h-4 w-4 accent-[#111111]"
            />
            로그인 상태 유지
          </label>
          {/* 두 링크를 구분자로 나란히 — 푸터 메타 줄과 같은 관례. */}
          <p className="ml-auto text-[13px] whitespace-nowrap">
            <Link
              href="/login/find-id"
              className="text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
            >
              아이디 찾기
            </Link>
            <span className="px-2 text-[#c2c8d1]">|</span>
            <Link
              href="/login/reset"
              className="text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </p>
        </div>

        <div className="mt-7">
          <Button type="button" variant="gradient" className="w-full" disabled={!canSubmit} onClick={handleLogin}>
            로그인
          </Button>
        </div>

        {/* 로그인 버튼과 이 줄 사이에는 구분선을 두지 않는다 — 로그인·회원가입은 "계정으로 하는 일"로
            한 덩어리다. 구분선은 방식이 다른 소셜 영역 위(SocialLoginButtons)에만 둔다. */}
        <p className="mt-6 text-center text-[13px] text-[#68717e]">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="font-medium text-[#111111] underline underline-offset-2">
            회원가입
          </Link>
        </p>

        <SocialLoginButtons />
      </div>
    </main>
  );
}
