"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/business/BusinessFormControls";
import { DuplicateCheckField } from "@/components/business/signup/DuplicateCheckField";

export interface AccountCreationInfo {
  accountId: string;
  password: string;
  passwordConfirm: string;
  agreeService: boolean;
  agreeOrgTerms: boolean;
  agreeMarketing: boolean;
}

export const emptyAccountCreationInfo: AccountCreationInfo = {
  accountId: "",
  password: "",
  passwordConfirm: "",
  agreeService: false,
  agreeOrgTerms: false,
  agreeMarketing: false,
};

export function AgreeCheckbox({
  label,
  required,
  checked,
  onChange,
}: {
  label: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 border border-border bg-white px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#111111]"
      />
      <span className="text-[13px] font-medium text-[#303946]">
        <span className="text-[#8a94a3]">[{required ? "필수" : "선택"}]</span> {label}
      </span>
    </label>
  );
}

/** STEP 3 — 계정 생성. 통합/약국 두 갈래가 그대로 공유하는 컴포넌트. */
export function AccountCreationStep({
  value,
  onChange,
  onBack,
  onSubmit,
}: {
  value: AccountCreationInfo;
  onChange: <K extends keyof AccountCreationInfo>(key: K, next: AccountCreationInfo[K]) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const passwordsMatch = value.password.trim() !== "" && value.password === value.passwordConfirm;
  const canSubmit =
    Boolean(value.accountId.trim()) && passwordsMatch && value.agreeService && value.agreeOrgTerms;

  return (
    <div>
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel required>아이디</FieldLabel>
          <DuplicateCheckField
            value={value.accountId}
            onChange={(v) => onChange("accountId", v)}
            placeholder="영문, 숫자 조합"
            availableMessage="사용 가능한 아이디입니다."
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>비밀번호</FieldLabel>
            <input
              type="password"
              value={value.password}
              onChange={(event) => onChange("password", event.target.value)}
              className="h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel required>비밀번호 확인</FieldLabel>
            <input
              type="password"
              value={value.passwordConfirm}
              onChange={(event) => onChange("passwordConfirm", event.target.value)}
              className="h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
            />
            {value.passwordConfirm && !passwordsMatch ? (
              <p className="text-[12px] font-medium text-danger">비밀번호가 일치하지 않습니다.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {/*
          "전문 보기"를 체크박스 줄 안쪽 오른쪽 끝에 겹쳐 둔다. 형제로 나란히 두면(flex) 그 줄의
          체크박스 박스만 링크 폭만큼 좁아져 위아래 줄과 오른쪽 끝이 어긋난다 — AgreeCheckbox가
          테두리 있는 전폭 박스라서다. right-4는 그 박스의 px-4와 같은 값이다.
          링크는 label 바깥이라 눌러도 체크가 켜지지 않는다(stopPropagation은 이중 안전장치).
          개인 가입(PersonalSignupClient.tsx)과 같은 구조다.

          이 항목은 이용약관과 개인정보 처리방침 둘을 한 줄로 묶고 있어 링크를 하나만 걸 수 있다.
          이용약관(/terms)으로 보낸다 — 그 화면의 전환 버튼으로 기관회원 약관까지 갈 수 있고,
          개인정보처리방침은 푸터에 따로 링크가 있다.
        */}
        <div className="relative">
          <AgreeCheckbox label="이용약관 및 개인정보 처리방침" required checked={value.agreeService} onChange={(v) => onChange("agreeService", v)} />
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="이용약관 및 개인정보 처리방침 전문 보기 (새 창)"
            onClick={(event) => event.stopPropagation()}
            className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-[12px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
          >
            전문 보기
          </Link>
        </div>
        <div className="relative">
          <AgreeCheckbox label="기관회원 서비스 이용약관" required checked={value.agreeOrgTerms} onChange={(v) => onChange("agreeOrgTerms", v)} />
          <Link
            href="/terms/business"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="기관회원 서비스 이용약관 전문 보기 (새 창)"
            onClick={(event) => event.stopPropagation()}
            className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-[12px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
          >
            전문 보기
          </Link>
        </div>
        <AgreeCheckbox label="마케팅 정보 수신" checked={value.agreeMarketing} onChange={(v) => onChange("agreeMarketing", v)} />
      </div>

      <div className="mt-9 flex justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          이전
        </Button>
        <Button type="button" variant="gradient" disabled={!canSubmit} onClick={onSubmit}>
          가입 완료
        </Button>
      </div>
    </div>
  );
}
