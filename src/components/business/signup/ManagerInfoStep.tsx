"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import type { OrgTrack } from "@/data/businessCompanyProfile";

const DEPARTMENT_PLACEHOLDER: Record<Exclude<OrgTrack, "pharmacy">, string> = {
  industry: "예: 인사팀",
  hospital: "예: 약제팀",
  research: "예: 연구지원팀",
};

const POSITION_PLACEHOLDER: Record<Exclude<OrgTrack, "pharmacy">, string> = {
  industry: "예: 채용 담당자",
  hospital: "예: 약제부장",
  research: "예: 책임연구원",
};

export interface ManagerInfo {
  managerName: string;
  department: string;
  position: string;
  phone: string;
  email: string;
}

export const emptyManagerInfo: ManagerInfo = {
  managerName: "",
  department: "",
  position: "",
  phone: "",
  email: "",
};

/** STEP 2 — 담당자 정보. 통합/약국 두 갈래가 그대로 공유하는 컴포넌트. */
export function ManagerInfoStep({
  value,
  onChange,
  onBack,
  onNext,
  track = "industry",
  representativePharmacistName,
}: {
  value: ManagerInfo;
  onChange: <K extends keyof ManagerInfo>(key: K, next: ManagerInfo[K]) => void;
  onBack: () => void;
  onNext: () => void;
  /** 가입 트랙 — "pharmacy"면 부서·직책을 감추고 "대표 약사와 동일" 채우기를 노출한다. */
  track?: OrgTrack;
  /** 약국 트랙에서 담당자명을 대표 약사명으로 채울 때 쓰는 값(약국 인증 스텝에서 캡처됨). */
  representativePharmacistName?: string;
}) {
  const isPharmacy = track === "pharmacy";
  const [sameAsPharmacist, setSameAsPharmacist] = useState(false);

  // 이메일 인증 — 목업 상태. verifiedEmail이 현재 value.email과 일치할 때만 "인증 완료"로 간주한다.
  const [emailVerifyStage, setEmailVerifyStage] = useState<"idle" | "sent">("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const isEmailVerified = verifiedEmail !== null && verifiedEmail === value.email && value.email.trim() !== "";

  const canProceed =
    Boolean(value.managerName.trim() && value.phone.trim() && value.email.trim()) && isEmailVerified;

  const toggleSameAsPharmacist = () => {
    const next = !sameAsPharmacist;
    setSameAsPharmacist(next);
    if (next) {
      onChange("managerName", representativePharmacistName ?? "");
    }
  };

  return (
    <div>
      <div className="space-y-5">
        {isPharmacy ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel required>담당자명</FieldLabel>
              <label className="flex items-center gap-1.5 text-[13px] font-medium text-[#4f5967]">
                <input
                  type="checkbox"
                  checked={sameAsPharmacist}
                  onChange={toggleSameAsPharmacist}
                  className="h-4 w-4 accent-[#111111]"
                />
                대표 약사와 동일
              </label>
            </div>
            <TextInput
              value={value.managerName}
              onChange={(v) => onChange("managerName", v)}
              placeholder="담당자 이름"
              disabled={sameAsPharmacist}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <FieldLabel required>담당자명</FieldLabel>
            <TextInput
              value={value.managerName}
              onChange={(v) => onChange("managerName", v)}
              placeholder="담당자 이름"
            />
          </div>
        )}
        {!isPharmacy ? (
          <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
            <div className="space-y-2">
              <FieldLabel>부서</FieldLabel>
              <TextInput
                value={value.department}
                onChange={(v) => onChange("department", v)}
                placeholder={DEPARTMENT_PLACEHOLDER[track as Exclude<OrgTrack, "pharmacy">]}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>직책</FieldLabel>
              <TextInput
                value={value.position}
                onChange={(v) => onChange("position", v)}
                placeholder={POSITION_PLACEHOLDER[track as Exclude<OrgTrack, "pharmacy">]}
              />
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>연락처</FieldLabel>
            <TextInput value={value.phone} onChange={(v) => onChange("phone", v)} placeholder="'-' 없이 숫자만 입력" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>이메일</FieldLabel>
            <TextInput
              value={value.email}
              disabled={isEmailVerified}
              onChange={(v) => {
                onChange("email", v);
                if (verifiedEmail !== null && v !== verifiedEmail) setVerifiedEmail(null);
                if (emailVerifyStage !== "idle") {
                  setEmailVerifyStage("idle");
                  setVerificationCode("");
                }
              }}
              placeholder="business@company.com"
              right={
                <button
                  type="button"
                  disabled={!value.email.trim() || isEmailVerified}
                  onClick={() => setEmailVerifyStage("sent")}
                  className="ml-2 h-11 shrink-0 whitespace-nowrap border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#c4cbd5] disabled:hover:border-[#d8e0e8]"
                >
                  인증
                </button>
              }
            />
            {emailVerifyStage === "sent" && !isEmailVerified ? (
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-[#5f6876]">인증 메일이 발송되었습니다.</p>
                <div className="flex">
                  <input
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="인증번호 6자리 입력"
                    className="h-11 min-w-0 flex-1 border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                  />
                  <button
                    type="button"
                    disabled={!verificationCode.trim()}
                    onClick={() => {
                      // 목업 — 실제 이메일 발송/코드 검증은 백엔드 연동 필요. 값이 비어있지 않으면 무조건 통과 처리한다.
                      setVerifiedEmail(value.email);
                    }}
                    className="ml-2 h-11 shrink-0 whitespace-nowrap border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#c4cbd5] disabled:hover:border-[#d8e0e8]"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : null}
            {isEmailVerified ? (
              <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[#17a68c]">
                <Check size={13} /> 인증 완료
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-9 flex justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          이전
        </Button>
        <Button type="button" variant="gradient" disabled={!canProceed} onClick={onNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
