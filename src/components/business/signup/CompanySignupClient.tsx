"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { DuplicateCheckField } from "@/components/business/signup/DuplicateCheckField";
import { FileUploadField } from "@/components/business/signup/FileUploadField";
import { SignupStepShell } from "@/components/business/signup/SignupStepShell";
import { ManagerInfoStep, emptyManagerInfo, type ManagerInfo } from "@/components/business/signup/ManagerInfoStep";
import { AccountCreationStep, emptyAccountCreationInfo, type AccountCreationInfo } from "@/components/business/signup/AccountCreationStep";
import { SignupCompleteStep } from "@/components/business/signup/SignupCompleteStep";
import { getOrgTrackForInstitutionType, signupInstitutionTypeOptions, writeSignupOrgTrack, type SignupInstitutionType } from "@/config/businessSignup";

const SEL_INPUT =
  "h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-8 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";

interface OrgVerificationInfo {
  institutionType: SignupInstitutionType | "";
  businessNumber: string;
  institutionName: string;
  representativeName: string;
  institutionCode: string;
  businessLicenseFileName: string | null;
}

const emptyOrgVerificationInfo: OrgVerificationInfo = {
  institutionType: "",
  businessNumber: "",
  institutionName: "",
  representativeName: "",
  institutionCode: "",
  businessLicenseFileName: null,
};

function OrgVerificationStep({
  value,
  onChange,
  onNext,
}: {
  value: OrgVerificationInfo;
  onChange: <K extends keyof OrgVerificationInfo>(key: K, next: OrgVerificationInfo[K]) => void;
  onNext: () => void;
}) {
  const isHospital = value.institutionType === "hospital";
  const canProceed = Boolean(
    value.institutionType &&
      value.businessNumber.trim() &&
      value.institutionName.trim() &&
      value.representativeName.trim() &&
      value.businessLicenseFileName &&
      (!isHospital || value.institutionCode.trim()),
  );

  return (
    <div>
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel required>기관 유형</FieldLabel>
          <div className="relative">
            <select
              value={value.institutionType}
              onChange={(event) => onChange("institutionType", event.target.value as SignupInstitutionType)}
              className={SEL_INPUT}
            >
              <option value="" disabled>
                기관 유형을 선택해 주세요
              </option>
              {signupInstitutionTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">선택한 유형에 맞는 관리 화면이 제공됩니다.</p>
        </div>

        <div className="space-y-2">
          <FieldLabel required>사업자등록번호</FieldLabel>
          <DuplicateCheckField
            value={value.businessNumber}
            onChange={(v) => onChange("businessNumber", v)}
            placeholder="'-' 없이 숫자만 입력"
            availableMessage="사용 가능한 사업자등록번호입니다."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>기관명</FieldLabel>
            <TextInput value={value.institutionName} onChange={(v) => onChange("institutionName", v)} placeholder="예: 더파마제약" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>대표자명</FieldLabel>
            <TextInput value={value.representativeName} onChange={(v) => onChange("representativeName", v)} placeholder="대표자 이름" />
          </div>
        </div>

        {isHospital ? (
          <div className="space-y-2">
            <FieldLabel required>요양기관번호</FieldLabel>
            <TextInput value={value.institutionCode} onChange={(v) => onChange("institutionCode", v)} placeholder="요양기관번호 8자리" />
            <p className="text-[11.5px] font-normal leading-[1.55] text-[#8a94a3]">
              병원 유형 선택 시에만 입력합니다. 요양기관 확인용으로 사용되며 공개되지 않습니다.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <FieldLabel required>사업자등록증명원</FieldLabel>
          <FileUploadField
            label="사업자등록증명원 업로드"
            hint="PDF, JPG, PNG"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelected={(name) => onChange("businessLicenseFileName", name)}
          />
          <div className="mt-1">
            <InfoNoticeBox>제출한 정보는 운영팀 검토 후 승인됩니다.</InfoNoticeBox>
          </div>
        </div>
      </div>

      <div className="mt-9 flex justify-end">
        <Button type="button" variant="gradient" disabled={!canProceed} onClick={onNext}>
          다음
        </Button>
      </div>
    </div>
  );
}

/** 기업·병원·연구기관 통합 가입 폼 — STEP1(기관 인증)만 트랙 전용, STEP2·3은 약국 폼과 완전히 같은 공유 컴포넌트를 쓴다. */
export function CompanySignupClient() {
  const [step, setStep] = useState<1 | 2 | 3 | "complete">(1);
  const [orgInfo, setOrgInfo] = useState<OrgVerificationInfo>(emptyOrgVerificationInfo);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>(emptyManagerInfo);
  const [accountInfo, setAccountInfo] = useState<AccountCreationInfo>(emptyAccountCreationInfo);

  const updateOrgInfo = <K extends keyof OrgVerificationInfo>(key: K, next: OrgVerificationInfo[K]) => {
    setOrgInfo((current) => ({ ...current, [key]: next }));
  };
  const updateManagerInfo = <K extends keyof ManagerInfo>(key: K, next: ManagerInfo[K]) => {
    setManagerInfo((current) => ({ ...current, [key]: next }));
  };
  const updateAccountInfo = <K extends keyof AccountCreationInfo>(key: K, next: AccountCreationInfo[K]) => {
    setAccountInfo((current) => ({ ...current, [key]: next }));
  };

  const handleComplete = () => {
    if (!orgInfo.institutionType) return;
    writeSignupOrgTrack(getOrgTrackForInstitutionType(orgInfo.institutionType));
    setStep("complete");
  };

  const orgTrack = orgInfo.institutionType ? getOrgTrackForInstitutionType(orgInfo.institutionType) : "industry";

  if (step === "complete") {
    return <SignupCompleteStep orgTrack={orgTrack} institutionName={orgInfo.institutionName} />;
  }

  return (
    <SignupStepShell
      step={step}
      title={step === 1 ? "기관 정보를 인증해 주세요" : step === 2 ? "담당자 정보를 입력해 주세요" : "계정을 생성해 주세요"}
      subtitle={
        step === 1
          ? "상세 정보는 가입 후 입력할 수 있습니다."
          : step === 2
            ? "공고 등록과 지원자 관리 관련 안내를 받을 담당자 정보입니다."
            : "이 계정으로 공고 등록과 지원자 관리를 이용할 수 있습니다."
      }
    >
      {step === 1 ? <OrgVerificationStep value={orgInfo} onChange={updateOrgInfo} onNext={() => setStep(2)} /> : null}
      {step === 2 ? (
        <ManagerInfoStep value={managerInfo} onChange={updateManagerInfo} onBack={() => setStep(1)} onNext={() => setStep(3)} track={orgTrack} />
      ) : null}
      {step === 3 ? (
        <AccountCreationStep value={accountInfo} onChange={updateAccountInfo} onBack={() => setStep(2)} onSubmit={handleComplete} />
      ) : null}
    </SignupStepShell>
  );
}
