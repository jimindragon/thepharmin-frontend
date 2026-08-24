"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoNoticeBox } from "@/components/shared/InfoNoticeBox";
import { FieldLabel, Segmented, TextInput, ToggleChip } from "@/components/business/BusinessFormControls";
import { PharmacyConfirmCard } from "@/components/business/PharmacyConfirmCard";
import { PharmacyRegistrySearch } from "@/components/business/PharmacyRegistrySearch";
import { DuplicateCheckField } from "@/components/business/signup/DuplicateCheckField";
import { FileUploadField } from "@/components/business/signup/FileUploadField";
import { SignupStepShell } from "@/components/shared/SignupStepShell";
import { ManagerInfoStep, emptyManagerInfo, type ManagerInfo } from "@/components/business/signup/ManagerInfoStep";
import { AccountCreationStep, emptyAccountCreationInfo, type AccountCreationInfo } from "@/components/business/signup/AccountCreationStep";
import { SignupCompleteStep } from "@/components/business/signup/SignupCompleteStep";
import { getPharmacyTypeLabel, pharmacyTypeLabels } from "@/config/companyTypes";
import { writeSignupOrgTrack, writeSignupPharmacyFeatureId, writeSignupPharmacyId, writeSignupPharmacyType } from "@/config/businessSignup";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import { getPharmacyRegistryEntry, type PharmacyRegistryEntry } from "@/data/pharmacyRegistry";
import type { PharmacyType } from "@/types/jobs";

/**
 * 약국을 지목하는 방법. 기본은 전국 등록부 검색이고, 등록부에서 찾지 못한 약국만 직접 입력으로 빠진다.
 * 두 방법의 값은 동시에 남지 않는다 — 전환할 때마다 반대쪽을 비운다.
 */
type PharmacyEntryMode = "search" | "manual";

/** 두 방법을 오가는 링크형 버튼. 필드가 아니라 빠져나가는 길이라 본문보다 한 단 낮은 회색 밑줄로 둔다. */
const ENTRY_MODE_LINK =
  "text-[13px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]";

/** 링크가 이미 주인이 있는 약국을 가리켰을 때. 여기서 해결할 수 없는 일이라 갈 곳을 함께 적는다 */
const ALREADY_CLAIMED_NOTICE = "이미 인증된 약국입니다. 관리자 변경이나 권한 요청은 고객센터로 문의해 주세요.";
const ALREADY_CLAIMED_HINT = "다른 약국을 인증하려면 검색하세요.";

interface PharmacyVerificationInfo {
  businessNumber: string;
  pharmacyEntryMode: PharmacyEntryMode;
  /** 등록부에서 고른 약국. 직접 입력 모드에서는 항상 null이다. */
  selectedPharmacy: PharmacyRegistryEntry | null;
  /** 두 방법이 공유하는 정본 약국명 — 검색 모드에서는 고른 약국의 이름이 그대로 복사된다. */
  pharmacyName: string;
  representativePharmacistName: string;
  pharmacistLicenseNumber: string;
  institutionCode: string;
  pharmacistLicenseFileName: string | null;
  pharmacyType: PharmacyType;
  /** 조제 특성, 단일선택(선택 항목). pharmacyFeatureOptions(config/jobFilters/pharmacyFilters.ts)의 id를 재사용 */
  pharmacyFeatureIds?: string;
}

const emptyPharmacyVerificationInfo: PharmacyVerificationInfo = {
  businessNumber: "",
  pharmacyEntryMode: "search",
  selectedPharmacy: null,
  pharmacyName: "",
  representativePharmacistName: "",
  pharmacistLicenseNumber: "",
  institutionCode: "",
  pharmacistLicenseFileName: null,
  pharmacyType: "local",
  pharmacyFeatureIds: undefined,
};

function PharmacyVerificationStep({
  value,
  onChange,
  onNext,
  pendingConfirmEntry,
  onConfirmEntry,
  onRejectEntry,
  alreadyClaimedEntry,
}: {
  value: PharmacyVerificationInfo;
  onChange: <K extends keyof PharmacyVerificationInfo>(key: K, next: PharmacyVerificationInfo[K]) => void;
  onNext: () => void;
  /** 링크로 지목돼 아직 확인받지 못한 약국. 있으면 검색창 대신 확인 카드가 선다 */
  pendingConfirmEntry: PharmacyRegistryEntry | null;
  onConfirmEntry: () => void;
  onRejectEntry: () => void;
  /** 링크가 가리킨 약국이 이미 인증된 경우 — 검색은 그대로 열어 두고 위에 사정을 적는다 */
  alreadyClaimedEntry: PharmacyRegistryEntry | null;
}) {
  const isManual = value.pharmacyEntryMode === "manual";

  /* 검색 모드는 "등록부에서 골랐는가"를, 직접 입력 모드는 "이름을 적었는가"를 본다.
     검색 모드에서 이름만 보면 안 된다 — 골랐다가 다시 검색해 선택이 풀린 상태에도 이름이 남아 통과한다. */
  const hasPharmacy = isManual ? Boolean(value.pharmacyName.trim()) : value.selectedPharmacy !== null;

  const canProceed = Boolean(
    value.businessNumber.trim() &&
      hasPharmacy &&
      value.representativePharmacistName.trim() &&
      value.pharmacistLicenseNumber.trim() &&
      value.institutionCode.trim() &&
      value.pharmacistLicenseFileName,
  );

  /** 고른 약국의 이름을 정본 필드로 복사한다 — 이후 화면(가입 완료 안내 등)은 이 이름 하나만 본다. */
  const selectPharmacy = (pharmacy: PharmacyRegistryEntry | null) => {
    onChange("selectedPharmacy", pharmacy);
    onChange("pharmacyName", pharmacy?.name ?? "");
  };

  /** 방법을 바꿀 때 반대쪽 값을 비운다 — 고른 약국과 직접 적은 이름이 동시에 남으면 어느 쪽이 정본인지 모른다. */
  const switchEntryMode = (next: PharmacyEntryMode) => {
    onChange("pharmacyEntryMode", next);
    onChange("selectedPharmacy", null);
    onChange("pharmacyName", "");
  };

  return (
    <div>
      <div className="space-y-5">
        {/* 약국을 먼저 지목하고 그 다음에 번호·사람을 확인한다 — 이 스텝이 답하는 질문이
            "어느 약국인가"라서, 종전처럼 사업자등록번호가 첫 칸에 서면 순서가 뒤집힌다. */}
        {pendingConfirmEntry ? (
          /* 상세에서 지목해 온 약국 — 검색을 다시 시키지 않고 맞는지만 묻는다 */
          <PharmacyConfirmCard entry={pendingConfirmEntry} onConfirm={onConfirmEntry} onChange={onRejectEntry} />
        ) : isManual ? (
          <div className="space-y-2">
            <FieldLabel required>약국명</FieldLabel>
            <TextInput value={value.pharmacyName} onChange={(v) => onChange("pharmacyName", v)} placeholder="예: 은행약국" />
            <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">
              직접 입력한 약국은 운영팀 검토 과정에서 확인 후 연결됩니다.
            </p>
            <div className="pt-0.5">
              <button type="button" onClick={() => switchEntryMode("search")} className={ENTRY_MODE_LINK}>
                약국 검색으로 돌아가기
              </button>
            </div>
          </div>
        ) : value.selectedPharmacy ? (
          /* 고른 뒤에는 검색창을 접고 확인 행만 남긴다 — 목록을 열어 둔 채로는 "이 약국으로 정했다"가 읽히지 않는다 */
          <div className="space-y-2">
            <FieldLabel required>약국 찾기</FieldLabel>
            <div className="flex items-start justify-between gap-3 border border-[#111111] bg-[#f7f8fa] px-4 py-3">
              <p className="min-w-0 text-[14px] font-normal leading-[1.6] text-[#4f5967]">
                <span className="font-semibold text-[#17202c]">선택됨: {value.selectedPharmacy.name}</span>
                {" · "}
                {value.selectedPharmacy.address}
              </p>
              <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={() => selectPharmacy(null)}>
                다시 선택
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* 링크가 가리킨 약국에 이미 주인이 있을 때 — 여기서 할 수 있는 일이 없다는 것을 먼저 말하고,
                그래도 다른 약국을 인증할 수는 있으므로 검색은 그대로 아래에 남긴다. */}
            {alreadyClaimedEntry ? (
              <div className="space-y-1.5 pb-1">
                <p className="text-[15px] font-normal leading-[1.6] text-[#333333]">{ALREADY_CLAIMED_NOTICE}</p>
                <p className="text-[13px] font-normal leading-[1.6] text-[#8a94a3]">{ALREADY_CLAIMED_HINT}</p>
              </div>
            ) : null}
            <PharmacyRegistrySearch
              label="약국 찾기"
              required
              radioName="pharmacy-signup-target"
              value={value.selectedPharmacy}
              onChange={selectPharmacy}
            />
            {/* 결과가 없을 때만 내주면 늦다 — 등록부에 아직 없는 약국은 검색을 해봐야 없다는 것을 알고,
                그 전에 빠져나갈 길이 보여야 한다. 그래서 결과 유무와 무관하게 상시 선다. */}
            <div className="pt-0.5">
              <button type="button" onClick={() => switchEntryMode("manual")} className={ENTRY_MODE_LINK}>
                찾는 약국이 없나요? 직접 입력하기
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <FieldLabel required>사업자등록번호</FieldLabel>
          <DuplicateCheckField
            value={value.businessNumber}
            onChange={(v) => onChange("businessNumber", v.replace(/\D/g, ""))}
            placeholder="숫자만 입력"
            availableMessage="사용 가능한 사업자등록번호입니다."
          />
        </div>

        {/* 약국명이 위 블록으로 올라가면서 짝을 잃어 전폭으로 선다 — 반 칸만 채운 2열은 빈 자리가 고장으로 읽힌다 */}
        <div className="space-y-2">
          <FieldLabel required>대표 약사명</FieldLabel>
          <TextInput value={value.representativePharmacistName} onChange={(v) => onChange("representativePharmacistName", v)} placeholder="대표 약사 이름" />
        </div>

        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <div className="space-y-2">
            <FieldLabel required>약사면허번호</FieldLabel>
            <TextInput
              value={value.pharmacistLicenseNumber}
              onChange={(v) => onChange("pharmacistLicenseNumber", v.replace(/\D/g, ""))}
              placeholder="숫자만 입력"
            />
          </div>
          {/* 약국을 골라도 이 칸은 남는다 — 등록부가 주는 식별자는 **암호화** 요양기호(PharmacyRegistryEntry.id)라
              사람이 적는 요양기관번호와 다른 값이고, 등록부 응답에 요양기관번호 자체는 들어 있지 않다. */}
          <div className="space-y-2">
            <FieldLabel required>요양기관번호</FieldLabel>
            <TextInput
              value={value.institutionCode}
              onChange={(v) => onChange("institutionCode", v.replace(/\D/g, ""))}
              placeholder="숫자만 입력"
            />
          </div>
        </div>
        <InfoNoticeBox>약사면허번호와 요양기관번호는 인증 확인용으로만 사용되며 공개되지 않습니다.</InfoNoticeBox>

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

        <div className="space-y-2">
          <FieldLabel>
            조제 특성 <span className="font-normal text-[#9aa3af]">(선택)</span>
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {pharmacyFeatureOptions.map((option) => (
              <ToggleChip
                key={option.id}
                label={option.label}
                selected={value.pharmacyFeatureIds === option.id}
                onClick={() => onChange("pharmacyFeatureIds", value.pharmacyFeatureIds === option.id ? undefined : option.id)}
              />
            ))}
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

const STEP_LABELS = ["약국 인증", "담당자 정보", "계정 생성"] as const;

/** 약국 가입 폼 — STEP1(약국 인증)만 전용, STEP2·3은 통합 폼과 완전히 같은 공유 컴포넌트를 쓴다. */
export function PharmacySignupClient({ initialPharmacyId }: { initialPharmacyId?: string }) {
  /**
   * 링크로 지목된 약국을 STEP1의 첫 상태로 접는다.
   *
   * useState 초기화 함수로 한 번만 계산한다 — 등록부는 정적 모듈이라 서버·클라이언트가 같은 값을
   * 내고, 이펙트로 미루면 첫 프레임에 빈 검색창이 한 번 스친다.
   *
   * 세 갈래다: 등록부에 없는(또는 파라미터 없는) 값이면 아무 일도 없고, 이미 주인이 있는 약국이면
   * 고르지 않은 채 사정만 알리고, 주인 없는 약국이면 확인 카드로 세운다.
   */
  const linkedEntry = useState(() => (initialPharmacyId ? getPharmacyRegistryEntry(initialPharmacyId) ?? null : null))[0];
  const alreadyClaimedEntry = linkedEntry?.companyId ? linkedEntry : null;
  const claimableEntry = linkedEntry && !linkedEntry.companyId ? linkedEntry : null;

  const [step, setStep] = useState<1 | 2 | 3 | "complete">(1);
  /** 확인 카드를 지났는가. 확인 전까지는 검색창 대신 그 카드가 선다 */
  const [entryConfirmed, setEntryConfirmed] = useState(false);
  const [pharmacyInfo, setPharmacyInfo] = useState<PharmacyVerificationInfo>(() =>
    claimableEntry
      ? { ...emptyPharmacyVerificationInfo, selectedPharmacy: claimableEntry, pharmacyName: claimableEntry.name, pharmacyEntryMode: "search" }
      : emptyPharmacyVerificationInfo,
  );
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
    writeSignupPharmacyFeatureId(pharmacyInfo.pharmacyFeatureIds);
    /** 인증 게이트가 이 값을 읽어 같은 약국을 다시 세운다 — 직접 입력으로 왔으면 등록부 id가 없어 비운다 */
    writeSignupPharmacyId(pharmacyInfo.selectedPharmacy?.id);
    setStep("complete");
  };

  if (step === "complete") {
    return <SignupCompleteStep orgTrack="pharmacy" institutionName={pharmacyInfo.pharmacyName} />;
  }

  return (
    <SignupStepShell
      step={step}
      labels={STEP_LABELS}
      eyebrow="기업회원 가입"
      title={step === 1 ? "약국 정보를 인증해 주세요" : step === 2 ? "담당자 정보를 입력해 주세요" : "계정을 생성해 주세요"}
      subtitle={
        step === 1
          ? "사업자등록번호, 약사면허번호, 요양기관번호를 확인해 인증합니다."
          : step === 2
            ? "공고 등록과 지원자 관리 관련 안내를 받을 담당자 정보입니다."
            : "이 계정으로 공고 등록과 지원자 관리를 이용할 수 있습니다."
      }
    >
      {step === 1 ? (
        <PharmacyVerificationStep
          value={pharmacyInfo}
          onChange={updatePharmacyInfo}
          onNext={() => setStep(2)}
          /* 확인을 받고 나면 카드가 물러나고 종전의 "선택됨: …" 행이 그 자리에 선다 */
          pendingConfirmEntry={claimableEntry && !entryConfirmed ? claimableEntry : null}
          onConfirmEntry={() => setEntryConfirmed(true)}
          /* 다른 약국을 고르겠다면 지목을 놓고 검색창으로 되돌린다 */
          onRejectEntry={() => {
            setEntryConfirmed(true);
            updatePharmacyInfo("selectedPharmacy", null);
            updatePharmacyInfo("pharmacyName", "");
          }}
          alreadyClaimedEntry={alreadyClaimedEntry}
        />
      ) : null}
      {step === 2 ? (
        <ManagerInfoStep
          value={managerInfo}
          onChange={updateManagerInfo}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          track="pharmacy"
          representativePharmacistName={pharmacyInfo.representativePharmacistName}
        />
      ) : null}
      {step === 3 ? (
        <AccountCreationStep value={accountInfo} onChange={updateAccountInfo} onBack={() => setStep(2)} onSubmit={handleComplete} />
      ) : null}
    </SignupStepShell>
  );
}
