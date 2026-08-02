"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

/** 비밀번호 재설정 1/3 — 이메일 입력. 껍데기·간격은 PersonalLoginClient의 것을 그대로 쓴다. */
export function PasswordResetRequestClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const canSubmit = Boolean(email.trim());

  // 로그인 화면과 같은 형태 — 검증 없이 다음 화면으로 보낸다.
  const handleSubmit = () => {
    router.push("/login/reset/sent");
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
        <Eyebrow>비밀번호 찾기</Eyebrow>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">비밀번호 재설정</h1>
        <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
          가입한 이메일 주소를 입력해 주세요.
          <br />
          비밀번호를 재설정할 수 있는 링크를 보내드립니다.
        </p>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <FieldLabel required>이메일 주소</FieldLabel>
            <TextInput value={email} onChange={setEmail} placeholder="example@email.com" />
          </div>
        </div>

        <div className="mt-7">
          <Button type="button" variant="primary" className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
            재설정 메일 받기
          </Button>
        </div>

        <div className="mt-8 border-t border-border" />
        <p className="mt-5 text-center text-[13px] text-[#68717e]">
          <Link href="/login" className="font-medium text-[#111111] underline underline-offset-2">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
