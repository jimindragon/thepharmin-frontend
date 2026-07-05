"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Segmented, TextInput } from "@/components/business/BusinessFormControls";
import { DuplicateCheckField } from "@/components/business/signup/DuplicateCheckField";
import { FileUploadField } from "@/components/business/signup/FileUploadField";
import { SignupStepShell } from "@/components/business/signup/SignupStepShell";
import { ManagerInfoStep, emptyManagerInfo, type ManagerInfo } from "@/components/business/signup/ManagerInfoStep";
import { AccountCreationStep, emptyAccountCreationInfo, type AccountCreationInfo } from "@/components/business/signup/AccountCreationStep";
import { SignupCompleteStep } from "@/components/business/signup/SignupCompleteStep";
import { getPharmacyTypeLabel, pharmacyTypeLabels } from "@/config/companyTypes";
import { writeSignupOrgTrack, writeSignupPharmacyType } from "@/config/businessSignup";
import type { PharmacyType } from "@/types/jobs";

interface PharmacyVerificationInfo {
  businessNumber: string;
  pharmacyName: string;
  representativePharmacistName: string;
  pharmacistLicenseNumber: string;
  institutionCode: string;
  pharmacistLicenseFileName: string | null;
  pharmacyType: PharmacyType;
}

const emptyPharmacyVerificationInfo: PharmacyVerificationInfo = {
  businessNumber: "",
  pharmacyName: "",
  representativePharmacistName: "",
  pharmacistLicenseNumber: "",
  institutionCode: "",
  pharmacistLicenseFileName: null,
  pharmacyType: "general",
};

function PharmacyVerificationStep({
  value,
  onChange,
  onNext,
}: {
  value: PharmacyVerificationInfo;
  onChange: <K extends keyof PharmacyVerificationInfo>(key: K, next: PharmacyVerificationInfo[K]) => void;
  onNext: () => void;
}) {
  const canProceed = Boolean(
    value.businessNumber.trim() &&
      value.pharmacyName.trim() &&
      value.representativePharmacistName.trim() &&
      value.pharmacistLicenseNumber.trim() &&
      value.institutionCode.trim() &&
      value.pharmacistLicenseFileName,
  );

  return (
    <div>
      <div className="space-y-5">
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
            <FieldLabel required>약국명</FieldLabel>
            <TextInput value={value.pharmacyName} onChange={(v) => onChange("pharmacyName", v)} placeholder="예: 은행약국" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>대표 약사명</FieldLabel>
            <TextInput value={value.representativePharmacistName} onChange={(v) => onChange("representativePharmacistName", v)} placeholder="대표 약사 이름" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>약사면허번호</FieldLabel>
            <TextInput value={value.pharmacistLicenseNumber} onChange={(v) => onChange("pharmacistLicenseNumber", v)} placeholder="제 00000호" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>요양기관번호</FieldLabel>
            <TextInput value={value.institutionCode} onChange={(v) => onChange("institutionCode", v)} placeholder="요양기관번호 8자리" />
          </div>
        </div>
        <div className="flex gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-normal leading-[1.6] text-[#6f7783]">
          <Info size={15} className="mt-0.5 shrink-0 text-[#7b8491]" />
          약사면허번호와 요양기관번호는 인증 확인용으로만 사용되며 공개되지 않습니다.
        </div>

        <div className="space-y-2">
          <FieldLabel required>약사면허증</FieldLabel>
          <FileUploadField
            label="약사면허증 업로드"
            hint="PDF, JPG, PNG"
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelected={(name) => onChange("pharmacistLicenseFileName", name)}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel required>약국 유형</FieldLabel>
          <Segmented
            value={value.pharmacyType}
            options={(Object.keys(pharmacyTypeLabels) as PharmacyType[]).map((id) => ({ id, label: getPharmacyTypeLabel(id) }))}
            onChange={(next) => onChange("pharmacyType", next)}
          />
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

/** 약국 가입 폼 — STEP1(약국 인증)만 전용, STEP2·3은 통합 폼과 완전히 같은 공유 컴포넌트를 쓴다. */
export function PharmacySignupClient() {
  const [step, setStep] = useState<1 | 2 | 3 | "complete">(1);
  const [pharmacyInfo, setPharmacyInfo] = useState<PharmacyVerificationInfo>(emptyPharmacyVerificationInfo);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo>(emptyManagerInfo);
  const [accountInfo, setAccountInfo] = useState<AccountCreationInfo>(emptyAccountCreationInfo);

  const updatePharmacyInfo = <K extends keyof PharmacyVerificationInfo>(key: K, next: PharmacyVerificationInfo[K]) => {
    setPharmacyInfo((current) => ({ ...current, [key]: next }));
  };
  const updateManagerInfo = <K extends keyof ManagerInfo>(key: K, next: ManagerInfo[K]) => {
    setManagerInfo((current) => ({ ...current, [key]: next }));
  };
  const updateAccountInfo = <K extends keyof AccountCreationInfo>(key: K, next: AccountCreationInfo[K]) => {
    setAccountInfo((current) => ({ ...current, [key]: next }));
  };

  const handleComplete = () => {
    writeSignupOrgTrack("pharmacy");
    writeSignupPharmacyType(pharmacyInfo.pharmacyType);
    setStep("complete");
  };

  if (step === "complete") {
    return <SignupCompleteStep orgTrack="pharmacy" institutionName={pharmacyInfo.pharmacyName} />;
  }

  return (
    <SignupStepShell
      step={step}
      track="pharmacy"
      title={step === 1 ? "약국 정보를 인증해 주세요" : step === 2 ? "담당자 정보를 입력해 주세요" : "계정을 생성해 주세요"}
      subtitle={
        step === 1
          ? "사업자등록번호, 약사면허번호, 요양기관번호를 확인해 인증합니다."
          : step === 2
            ? "공고 등록과 지원자 관리 관련 안내를 받을 담당자 정보입니다."
            : "이 계정으로 공고 등록과 지원자 관리를 이용할 수 있습니다."
      }
    >
      {step === 1 ? <PharmacyVerificationStep value={pharmacyInfo} onChange={updatePharmacyInfo} onNext={() => setStep(2)} /> : null}
      {step === 2 ? (
        <ManagerInfoStep value={managerInfo} onChange={updateManagerInfo} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      ) : null}
      {step === 3 ? (
        <AccountCreationStep value={accountInfo} onChange={updateAccountInfo} onBack={() => setStep(2)} onSubmit={handleComplete} />
      ) : null}
    </SignupStepShell>
  );
}
