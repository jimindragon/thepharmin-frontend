"use client";

import { Button } from "@/components/ui/Button";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
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
        <span className={required ? "text-danger" : "text-[#8a94a3]"}>[{required ? "필수" : "선택"}]</span> {label}
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
        <AgreeCheckbox label="이용약관 및 개인정보 처리방침" required checked={value.agreeService} onChange={(v) => onChange("agreeService", v)} />
        <AgreeCheckbox label="기관회원 서비스 이용약관" required checked={value.agreeOrgTerms} onChange={(v) => onChange("agreeOrgTerms", v)} />
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
