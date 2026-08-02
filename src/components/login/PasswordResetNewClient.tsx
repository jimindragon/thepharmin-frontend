"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/business/BusinessFormControls";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";

/**
 * TextInput이 type prop을 받지 않아 비밀번호는 생 input을 쓴다 — PersonalLoginClient와 같은 이유·같은 값.
 * 값을 다시 타이핑하지 않고 그쪽 상수를 그대로 옮겨 왔다(alpha modifier가 조용히 깨진 전례가 있어 손대지 않는다).
 */
const RAW_INPUT =
  "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal leading-tight text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

/**
 * 비밀번호 재설정 3/3 — 새 비밀번호 설정.
 *
 * 비밀번호 규칙은 안내문으로만 보여주고 실제로 검증하지 않는다(목데이터 단계).
 * 재설정은 세션과 무관하므로 쿠키를 쓰거나 지우지 않는다.
 * 완료는 새 라우트가 아니라 같은 화면의 상태 전환으로 처리한다.
 */
export function PasswordResetNewClient() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [done, setDone] = useState(false);

  const canSubmit = password.trim() !== "" && passwordConfirm.trim() !== "";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[440px] border border-border bg-white p-10 max-[560px]:p-6">
        {done ? (
          <>
            <Eyebrow>비밀번호 재설정</Eyebrow>
            <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">비밀번호가 변경되었습니다</h1>
            <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">새 비밀번호로 로그인해 주세요.</p>

            <div className="mt-7">
              <LinkButton href="/login" variant="primary" className="w-full">
                로그인하기
              </LinkButton>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>비밀번호 재설정</Eyebrow>
            <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">새 비밀번호 설정</h1>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <FieldLabel required>새 비밀번호</FieldLabel>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={RAW_INPUT}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel required>새 비밀번호 확인</FieldLabel>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className={RAW_INPUT}
                />
              </div>
            </div>

            <p className="mt-3 text-[13px] font-normal leading-[1.7] text-[#68717e]">
              영문 대문자, 소문자, 숫자를 포함해 8~20자로 입력해 주세요.
            </p>

            <div className="mt-7">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={!canSubmit}
                onClick={() => setDone(true)}
              >
                비밀번호 변경하기
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
