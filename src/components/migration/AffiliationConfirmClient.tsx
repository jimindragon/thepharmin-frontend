"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { SEL } from "@/components/job-registration/fieldClasses";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import {
  affiliationConfig,
  memberAffiliationOptions,
  memberGradeOptions,
  memberPositionOptions,
  shouldShowLicenseField,
  GRADE_BASE_YEAR,
  type MemberAffiliationId,
  type MemberOption,
  type StudentGrade,
} from "@/config/memberAffiliation";
import { defaultLegacyOccupationId, getLegacyOccupation, type LegacyOccupation } from "@/config/legacyOccupationMap";

/**
 * 기존 뉴스 회원의 소속 확인 화면 — 재동의(/migration) 다음 단계.
 *
 * 기존 직종 12종을 새 소속 체계로 옮기되, 자동 변환되는 항목은 미리 채우고 확인만 받는다.
 * 무엇이 미리 채워지는지와 문구는 legacyOccupationMap.ts의 burden이 정한다.
 *
 * 입력값은 저장하지 않는다(저장 파이프라인 대기). 이 화면으로 보내는 연결도 이번 범위가 아니다.
 */

const GROUP_TITLE = "text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]";

/**
 * ⚠️ 아래 OptionButtonGroup·프로필 입력 묶음은 개인 가입 폼 STEP2(PersonalSignupClient.tsx의
 * OptionButtonGroup / ProfileGroup / PharmacistLicenseField)를 복제한 것이다.
 * 그쪽은 모두 모듈 내부 함수라 export되어 있지 않고 components/signup/은 무변경이 원칙이라
 * 공용으로 뺄 수 없었다.
 *
 * 합류 지점: PersonalSignupClient.tsx의 OptionButtonGroup(38행)·ProfileGroup(258행)·
 * PharmacistLicenseField(225행)를 shared로 옮기면 이 파일의 같은 이름 3개를 지우고 import로 바꾼다.
 * 그때 유일하게 남겨야 할 차이는 "면허번호가 필수인지 선택인지"다(아래 참고).
 */
function OptionButtonGroup({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: MemberOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={clsx(
            "h-9 border px-3 text-[13px] font-medium transition-colors",
            value === option.id
              ? "border-[#111111] bg-[#111111] text-white"
              : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:text-[#111111]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * 약사 면허 칸 — 가입 폼과 달리 여기서는 **선택**이다.
 *
 * 신규 가입자는 가입할 마음을 먹고 온 상태라 면허번호를 필수로 받아도 되지만, 기존 회원은
 * 기사를 보러 왔다가 이 화면에 붙잡힌 상황이다. 여기서 강제하면 등록이 아니라 이탈이 된다.
 * 면허는 나중에 마이페이지에서 받는다.
 */
function OptionalLicenseField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <FieldLabel>
        약사 면허번호 <span className="font-normal text-[#9aa3af]">(선택)</span>
      </FieldLabel>
      <TextInput value={value} onChange={(v) => onChange(v.replace(/\D/g, ""))} placeholder="숫자만 입력" />
      <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">나중에 마이페이지에서 등록하셔도 됩니다.</p>
    </div>
  );
}

interface ProfileState {
  affiliationId: MemberAffiliationId | "";
  secondaryId: string;
  hasPharmacistLicense: boolean;
  licenseNumber: string;
  orgName: string;
  /** 학생 전용. 가입 폼과 같은 형태 — 선택 시점의 기준 연도를 함께 담는다(학년은 해마다 올라가므로). */
  studentGrade: StudentGrade | null;
  positionId: string;
}

/** 소속 유형을 바꿀 때 초기화되는 부분 — 가입 폼의 resetProfileBelowAffiliation과 같은 범위. */
const resetBelowAffiliation = {
  secondaryId: "",
  hasPharmacistLicense: false,
  licenseNumber: "",
  orgName: "",
  studentGrade: null,
  positionId: "",
} as const;

function buildInitialProfile(occupation: LegacyOccupation): ProfileState {
  return {
    ...resetBelowAffiliation,
    affiliationId: occupation.affiliationId ?? "",
    secondaryId: occupation.secondaryId ?? "",
  };
}

/** 변환표의 2차 선택은 그 소속의 2차 선택지에 실제로 있을 때만 되살린다(예: RA·인허가는 병원 직무 목록에 없다). */
function presetSecondaryFor(affiliationId: MemberAffiliationId, occupation: LegacyOccupation): string {
  const options = affiliationConfig[affiliationId].secondary?.options ?? [];
  return occupation.secondaryId && options.some((option) => option.id === occupation.secondaryId)
    ? occupation.secondaryId
    : "";
}

export function AffiliationConfirmClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  /**
   * 실제 회원 데이터가 없어 기존 직종을 URL로 지정한다 — 개발 확인용 쿼리다(?from=<기존직종id>).
   * ?orgStatus·?track과 같은 성격이며, 인증이 붙으면 서버가 내려주는 회원 필드로 대체된다.
   * useOrgVerificationStatus와 같은 이유로 마운트 후에 읽는다(서버에서는 URL 쿼리를 이 컴포넌트가 알 수 없다).
   */
  const [occupation, setOccupation] = useState<LegacyOccupation>(() => getLegacyOccupation(defaultLegacyOccupationId));
  const [profile, setProfile] = useState<ProfileState>(() =>
    buildInitialProfile(getLegacyOccupation(defaultLegacyOccupationId)),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const from = new URLSearchParams(window.location.search).get("from");
    if (!from) return;

    const next = getLegacyOccupation(from);
    setOccupation(next);
    setProfile(buildInitialProfile(next));
  }, []);

  const config = profile.affiliationId ? affiliationConfig[profile.affiliationId] : null;
  const showLicense = config ? shouldShowLicenseField(config, profile.secondaryId, profile.hasPharmacistLicense) : false;

  const updateProfile = <K extends keyof ProfileState>(key: K, next: ProfileState[K]) => {
    setProfile((current) => ({ ...current, [key]: next }));
  };

  // 소속을 바꾸면 아래 항목을 전부 비운다. 2차만은 변환표 값이 그 소속에서 유효할 때 되살린다.
  const handleAffiliationChange = (id: MemberAffiliationId) => {
    setProfile({ ...resetBelowAffiliation, affiliationId: id, secondaryId: presetSecondaryFor(id, occupation) });
  };

  /**
   * 완료 조건 — 소속 유형 + (2차가 있는 소속이면) 2차 + (소속명이 있으면) 소속명 +
   * (칸이 나오는 소속이면) 학년·직급. 가입 폼의 canProceedFromProfile과 같은 범위다.
   * 면허번호만은 여기서 선택으로 남는다(OptionalLicenseField 주석 참고).
   */
  const canSubmit = Boolean(
    profile.affiliationId &&
      (!config?.secondary || profile.secondaryId) &&
      (!config?.orgNameLabel || profile.orgName.trim()) &&
      (!config?.showGrade || profile.studentGrade) &&
      (!config?.showPosition || profile.positionId),
  );

  /**
   * 확인 완료·나중에 하기 둘 다 원래 가려던 곳으로 보낸다 — 이 화면은 건너뛸 수 있는 단계라
   * 두 길의 도착지가 같아야 한다. 입력값은 아직 저장하지 않는다(저장 파이프라인 대기).
   */
  const goToDestination = () => router.push(redirectTo);

  const isHeavy = occupation.burden === "heavy";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[720px] border border-border bg-white p-10 max-[560px]:p-6">
        <Eyebrow>회원 정보 확인</Eyebrow>
        <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">
          {isHeavy ? "소속 정보 입력" : "회원 정보 확인"}
        </h1>
        {isHeavy ? (
          // 기존 직종명을 문장에 그대로 넣는다 — 왜 다시 골라야 하는지가 납득돼야 한다.
          <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            소속 분류 체계가 개편되었습니다.
            <br />
            기존 &lsquo;{occupation.label}&rsquo; 항목이 세분화되어 다시 선택이 필요합니다.
          </p>
        ) : (
          <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
            회원 정보 분류 체계가 개편되었습니다.
            <br />
            기존 정보를 반영해 두었습니다. 내용을 확인해 주세요.
          </p>
        )}

        <div className="mt-8">
          <h2 className={GROUP_TITLE}>프로필 정보</h2>
          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <FieldLabel required>소속 유형</FieldLabel>
              <OptionButtonGroup
                options={memberAffiliationOptions}
                value={profile.affiliationId}
                onChange={(id) => handleAffiliationChange(id as MemberAffiliationId)}
                ariaLabel="소속 유형"
              />
            </div>

            {config?.secondary ? (
              <div className="space-y-2">
                <FieldLabel required>{config.secondary.label}</FieldLabel>
                {config.secondary.hint ? (
                  <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">{config.secondary.hint}</p>
                ) : null}
                <OptionButtonGroup
                  options={config.secondary.options}
                  value={profile.secondaryId}
                  onChange={(id) => updateProfile("secondaryId", id)}
                  ariaLabel={config.secondary.label}
                />
              </div>
            ) : null}

            {config?.licenseMode === "checkbox" ? (
              <label className="flex items-center gap-2.5 border border-border bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={profile.hasPharmacistLicense}
                  onChange={(event) => updateProfile("hasPharmacistLicense", event.target.checked)}
                  className="h-4 w-4 accent-[#111111]"
                />
                <span className="text-[13px] font-medium text-[#303946]">약사 면허를 보유하고 있습니다</span>
              </label>
            ) : null}

            {showLicense ? (
              <OptionalLicenseField value={profile.licenseNumber} onChange={(v) => updateProfile("licenseNumber", v)} />
            ) : null}

            {config?.orgNameLabel ? (
              <div className="space-y-2">
                <FieldLabel required>{config.orgNameLabel}</FieldLabel>
                <TextInput
                  value={profile.orgName}
                  onChange={(v) => updateProfile("orgName", v)}
                  placeholder={`${config.orgNameLabel}을 입력해 주세요`}
                />
              </div>
            ) : null}

            {config?.showGrade ? (
              <div className="space-y-2">
                <FieldLabel required>학년</FieldLabel>
                <OptionButtonGroup
                  options={memberGradeOptions}
                  value={profile.studentGrade ? String(profile.studentGrade.grade) : ""}
                  onChange={(id) => updateProfile("studentGrade", { grade: Number(id), baseYear: GRADE_BASE_YEAR })}
                  ariaLabel="학년"
                />
                <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">
                  {GRADE_BASE_YEAR}년 기준으로 저장됩니다. 4년제 전공이면 4학년까지만 선택하시면 됩니다.
                </p>
              </div>
            ) : null}

            {config?.showPosition ? (
              <div className="space-y-2">
                <FieldLabel required htmlFor="migration-position">
                  직급
                </FieldLabel>
                <select
                  id="migration-position"
                  value={profile.positionId}
                  onChange={(event) => updateProfile("positionId", event.target.value)}
                  className={SEL}
                >
                  <option value="">선택해 주세요</option>
                  {memberPositionOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <Button type="button" variant="gradient" className="w-full" disabled={!canSubmit} onClick={goToDestination}>
            확인 완료
          </Button>
        </div>

        {/* 건너뛸 수는 있되 눈에 먼저 띄지 않게 — 버튼이 아니라 작은 링크로 둔다. */}
        <p className="mt-5 text-center">
          <button
            type="button"
            onClick={goToDestination}
            className="text-[13px] font-normal text-[#8a94a3] underline underline-offset-2 transition hover:text-[#4f5967]"
          >
            나중에 하기
          </button>
        </p>
      </div>
    </main>
  );
}
