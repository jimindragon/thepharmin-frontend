"use client";

import Link from "next/link";
import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { PhoneVerificationField } from "@/components/signup/PhoneVerificationField";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

/** 목데이터 — 인증만 통과하면 조회 없이 이 아이디를 돌려준다. */
const FOUND_ACCOUNT_ID = "kimjimin92";

/**
 * 아이디를 앞 3자·뒤 2자만 남기고 가운데를 가린다(kimjimin92 → kim*****92).
 *
 * 본인 확인을 마친 뒤라도 화면에 통째로 띄우지 않는 것이 관례다 — 어깨너머로 보이거나 캡처가 남는다.
 * 길이는 그대로 두어 별 개수가 감춘 글자 수와 같다. 본인은 자기 아이디를 알아볼 수 있어야 하고,
 * 길이를 숨겨봐야 앞뒤 5자가 이미 나가 있어 얻는 것이 없다.
 *
 * 짧아서 앞3+뒤2가 안 나오면 뒤를 먼저 포기한다 — 6자 미만에서 뒤 2자까지 내주면 가린 글자가
 * 한둘뿐이라 가리는 의미가 없어진다.
 */
export function maskAccountId(accountId: string): string {
  const length = accountId.length;
  if (length <= 3) return `${accountId.slice(0, 1)}${"*".repeat(Math.max(length - 1, 0))}`;
  if (length < 6) return `${accountId.slice(0, 2)}${"*".repeat(length - 2)}`;
  return `${accountId.slice(0, 3)}${"*".repeat(length - 5)}${accountId.slice(-2)}`;
}

/**
 * 아이디 찾기 — 이름 + 휴대폰 인증 → 결과.
 *
 * 껍데기·간격은 PasswordResetRequestClient의 것을 그대로 쓴다.
 * 결과를 별도 라우트로 빼지 않는 이유 — 그러면 인증을 건너뛰고 주소만 쳐도 아이디가 보인다.
 * 비밀번호 재설정이 단계마다 라우트를 나눈 것은 메일 링크로 도착해야 해서지 단계를 나눈 것 자체가
 * 목적이 아니었다.
 */
export function FindIdClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  /** 번호가 바뀌면 인증 상태를 초기화한다(가입 폼과 같은 방식). */
  const updatePhone = (next: string) => {
    setPhone(next);
    setPhoneVerified(false);
  };

  const canSubmit = Boolean(name.trim()) && phoneVerified;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
        <Eyebrow>아이디 찾기</Eyebrow>

        {foundId === null ? (
          <>
            <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">아이디 찾기</h1>
            <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
              가입 시 등록한 정보로 아이디를 확인하실 수 있습니다.
            </p>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <FieldLabel required>이름</FieldLabel>
                <TextInput value={name} onChange={setName} placeholder="이름을 입력해 주세요" />
              </div>
              <PhoneVerificationField
                value={phone}
                onChange={updatePhone}
                isVerified={phoneVerified}
                onVerified={() => setPhoneVerified(true)}
              />
            </div>

            <div className="mt-7">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={!canSubmit}
                onClick={() => setFoundId(FOUND_ACCOUNT_ID)}
              >
                아이디 확인
              </Button>
            </div>

            <div className="mt-8 border-t border-border" />
            <p className="mt-5 text-center text-[13px] text-[#68717e]">
              <Link href="/login" className="font-medium text-[#111111] underline underline-offset-2">
                로그인으로 돌아가기
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">회원님의 아이디입니다</h1>
            <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
              개인정보 보호를 위해 아이디의 일부만 표시됩니다.
            </p>

            <div className="mt-8 border border-border bg-[#f8f9fa] px-5 py-6 text-center">
              <p className="text-[22px] font-bold tracking-[-0.01em] text-[#17202c]">{maskAccountId(foundId)}</p>
            </div>

            <div className="mt-7">
              <LinkButton href="/login" variant="primary" className="w-full">
                로그인하기
              </LinkButton>
            </div>

            <div className="mt-8 border-t border-border" />
            <p className="mt-5 text-center text-[13px] text-[#68717e]">
              비밀번호가 기억나지 않으신가요?{" "}
              <Link href="/login/reset" className="font-medium text-[#111111] underline underline-offset-2">
                비밀번호 찾기
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
