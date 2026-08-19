"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { Button } from "@/components/ui/Button";
import { sharedRoutes } from "@/config/routes";
import { markBusinessMember } from "@/hooks/useBusinessMember";

/**
 * TextInput이 type prop을 받지 않아 비밀번호는 생 input을 쓴다.
 * 개인 로그인(PersonalLoginClient)에도 같은 값의 상수가 있지만 일부러 공유하지 않는다 —
 * 두 로그인 화면이 서로의 변경에 끌려가지 않게 한다.
 */
const RAW_INPUT =
  "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal leading-tight text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

export function BusinessLoginClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  // 기업 계정의 로그인 식별자는 이메일이 아니라 아이디다 — 담당자 간 인수인계 대상이기 때문.
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const canSubmit = Boolean(loginId.trim()) && password.trim() !== "";

  // 개인 로그인(PersonalLoginClient)과 같은 형태 — 자격 검증 없이 세션 쿠키만 쓰고 이동한다.
  const handleLogin = () => {
    markBusinessMember();
    router.push(redirectTo);
  };

  return (
    <>
      <AuthHeader />
      {/*
        카드를 화면 세로 가운데에 둔다. 개인 로그인(PersonalLoginClient)은 같은 껍데기를 쓰면서도
        위에서부터 쌓는데(py-16 상단 정렬), 그쪽은 설명 한 줄과 소셜 로그인까지 있어 카드가 화면을
        거의 채운다 — 이 카드는 눈썹 문구까지 빠지며 더 짧아져, 같은 상단 정렬로는 아래로 푸터까지
        빈 벌판이 남는다. 배치가 다른 이유가 있으니 개인 로그인을 따라가지 않는다.

        세로 중앙 정렬은 이 코드베이스에 이미 있는 문법을 쓴다 — `grid place-items-center` +
        자식의 `w-full max-w-[...]`(OverlayPanel, jobs/[slug]·companies/[companyId]의 안내 화면).
        w-full이 없으면 그리드 아이템이 콘텐츠 폭으로 줄어 카드가 440px에 못 미친다.
        px/py는 종전 값 그대로다 — 화면이 짧아 카드가 다 안 들어가는 폭에서는 이 여백이 남는다.
      */}
      <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
        <div className="w-full max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
          {/* 눈썹 문구("기업회원 로그인")와 제목("기업 로그인")이 같은 말을 두 번 하고 있었다.
              카드 안에서 이름을 대는 줄은 하나면 된다 — 개인 로그인처럼 제목 아래 설명이 붙는
              구성도 아니라, 남길 한 줄은 더 구체적인 쪽인 "기업회원 로그인"이다. */}
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">기업회원 로그인</h1>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <FieldLabel required>아이디</FieldLabel>
              <TextInput value={loginId} onChange={setLoginId} />
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

          {/* 개인 로그인은 이 줄에 "비밀번호를 잊으셨나요?"가 함께 있어 justify-between을 쓴다.
              기업은 아이디 방식이라 이메일 재설정 흐름을 쓸 수 없어 체크박스만 남는다. */}
          <div className="mt-4 flex items-center">
            <label className="flex items-center gap-2 text-[13px] text-[#4f5967]">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(event) => setKeepSignedIn(event.target.checked)}
                className="h-4 w-4 accent-[#111111]"
              />
              로그인 상태 유지
            </label>
          </div>

          <div className="mt-7">
            <Button type="button" variant="gradient" className="w-full" disabled={!canSubmit} onClick={handleLogin}>
              로그인
            </Button>
          </div>

          <div className="mt-8 border-t border-border" />
          <p className="mt-5 text-center text-[13px] text-[#68717e]">
            기업 계정이 없으신가요?{" "}
            <Link href="/business/signup" className="font-medium text-[#111111] underline underline-offset-2">
              기업 계정 신청
            </Link>
          </p>
          {/* 기업 계정은 아이디 방식이라 이메일로 스스로 되찾는 흐름이 없다(위 "로그인 상태 유지" 줄에
              재설정 링크가 없는 것과 같은 이유) — 막힌 사람이 갈 곳은 고객센터뿐이라 그 자리를 알린다.
              경로는 여러 화면이 함께 가리키는 값이라 sharedRoutes를 거친다(config/routes.ts). */}
          <p className="mt-2 text-center text-[13px] text-[#8a94a3]">
            아이디·비밀번호를 잊으셨나요?{" "}
            <Link href={sharedRoutes.support} className="font-medium text-[#4f5967] underline underline-offset-2">
              고객센터
            </Link>
            로 문의해 주세요
          </p>
        </div>
      </main>
    </>
  );
}
