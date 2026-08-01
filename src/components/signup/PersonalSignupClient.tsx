"use client";

import clsx from "clsx";
import { BadgeCheck, Check, Mail } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { InlineInfoHint } from "@/components/shared/InlineInfoHint";
import { SignupStepShell } from "@/components/shared/SignupStepShell";
import { AgreeCheckbox } from "@/components/business/signup/AccountCreationStep";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";
import { FileUploadField } from "@/components/business/signup/FileUploadField";
import { SEL } from "@/components/job-registration/fieldClasses";
import { PhoneVerificationField } from "@/components/signup/PhoneVerificationField";
import {
  affiliationConfig,
  memberAffiliationOptions,
  memberPositionOptions,
  shouldShowLicenseField,
  type MemberAffiliationId,
  type MemberOption,
} from "@/config/memberAffiliation";

const STEP_LABELS = ["약관 동의", "회원 정보", "가입 완료"] as const;

/** 가입 폼은 SignupStepShell이 이미 카드(section)를 그리므로 SectionCard를 중첩하지 않고 제목만 맞춘다. */
const GROUP_TITLE = "text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]";

/** 비밀번호처럼 TextInput이 커버하지 못하는 입력(type 지정 필요)에 쓰는 클래스. */
const RAW_INPUT =
  "h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal leading-tight text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]";

/**
 * 버튼 나열 단일선택. 색은 이력서 편집기의 "희망 분야" 버튼을 따르되, 크기는 선택지가 많을 때 쓰는
 * 규격(ToggleChip/ChipGroup의 h-9 px-3)을 쓴다 — 소속 유형 13개·희망 직무 14개라 min-w 고정이 맞지 않는다.
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

/** STEP1 동의 항목. 필수 3종(age14/service/privacy)만 진행 조건에 들어가고 마케팅 2종은 선택이다. */
interface AgreementState {
  age14: boolean;
  service: boolean;
  privacy: boolean;
  marketingEmail: boolean;
  marketingSms: boolean;
}

const emptyAgreementState: AgreementState = {
  age14: false,
  service: false,
  privacy: false,
  marketingEmail: false,
  marketingSms: false,
};

/** 약관 본문 미리보기 — 본문은 아직 확정 전이라 자리표시자만. "전문 보기"는 연결 예정(동작 없음).
 * 시각 스펙은 InfoNoticeBox(shared/InfoNoticeBox.tsx)의 테두리·배경·타이포를 따르되 아이콘 없이 스크롤 영역만 둔다. */
function TermsPreview() {
  return (
    <div className="mt-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3">
      <div className="flex justify-end">
        <a href="#" className="text-[12px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]">
          전문 보기
        </a>
      </div>
      <div className="mt-1.5 max-h-[96px] overflow-y-auto text-[12px] font-normal leading-[1.6] text-[#6f7783]">
        <p>약관 본문 준비 중</p>
      </div>
    </div>
  );
}

/**
 * STEP 3 — 가입 완료. 기업 폼과 달리 셸 안에 남겨 스텝 표시기가 계속 보인다.
 * 유입 경로(뉴스/리크루트)별 안내·버튼 분기는 경로를 판별할 수단이 아직 없어 이번 범위에서 제외했다.
 */
/**
 * 완료 화면의 안내 한 덩어리 — 아이콘 → 소제목 → 본문 세로 배치, 전부 가운데 정렬.
 * 가로 폭을 쓰지 않아 카드가 넓어도 양옆이 비어 보이지 않는다.
 */
function DoneNotice({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <span className="mx-auto block w-fit text-[#596373]">{icon}</span>
      <p className="mt-3 text-[15px] font-bold text-[#17202c]">{title}</p>
      {/* max-w — 한 줄로 늘어지지 않고 두 줄로 균형 있게 끊기는 폭(자연 1줄 폭 485px 기준 실측).
          break-keep 필수 — 한국어는 기본값이면 "인/증"처럼 단어 중간에서도 줄이 갈린다. */}
      <p className="mx-auto mt-2 max-w-[280px] break-keep text-[14px] leading-[1.7] text-[#4f5967]">{children}</p>
    </div>
  );
}

function SignupDoneStep({ hasPharmacistLicense }: { hasPharmacistLicense: boolean }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center bg-[#111111] text-white">
        <Check size={26} />
      </span>
      <div className="mt-6">
        <Eyebrow align="center">개인회원 가입</Eyebrow>
      </div>
      <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">가입이 완료되었습니다</h1>
      <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">
        더파마뉴스와 더파마 리크루트를 모두 이용하실 수 있습니다.
      </p>

      <div className="mt-8 border-t border-border" />

      {/* 각 안내가 세로형이라 폭 제한이 필요 없다. 덩어리 구분은 구분선 없이 여백으로만. */}
      <div className="mt-10 space-y-10">
        <DoneNotice icon={<Mail size={28} aria-hidden />} title="이메일 인증">
          입력하신 이메일로 인증 링크를 보내드렸습니다. 인증 후 모든 기능을 이용하실 수 있습니다.
        </DoneNotice>
        {hasPharmacistLicense ? (
          <DoneNotice icon={<BadgeCheck size={28} aria-hidden />} title="약사 인증">
            약사 인증은 면허증 확인 후 완료됩니다. 마이페이지에서 진행 상태를 확인하실 수 있습니다.
          </DoneNotice>
        ) : null}
      </div>

      <div className="mt-10 border-t border-border" />

      <div className="mt-8 flex flex-col gap-2.5">
        <LinkButton href="/jobs" variant="gradient" className="w-full">
          채용 공고 보러 가기
        </LinkButton>
        <LinkButton href="/" variant="secondary" className="w-full">
          홈으로
        </LinkButton>
      </div>
    </div>
  );
}

/** STEP2 계정 정보 + 본인 확인. 프로필(소속 유형·직무 등) 묶음은 다음 단계에서 추가한다. */
interface MemberInfoState {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
}

const emptyMemberInfoState: MemberInfoState = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  phone: "",
};

/** STEP2 프로필 묶음. 소속 유형에 따라 이후 항목의 구성이 통째로 바뀐다. */
interface ProfileState {
  affiliationId: MemberAffiliationId | "";
  secondaryId: string;
  hasPharmacistLicense: boolean;
  licenseNumber: string;
  licenseFileName: string | null;
  orgName: string;
  studentId: string;
  positionId: string;
}

const emptyProfileState: ProfileState = {
  affiliationId: "",
  secondaryId: "",
  hasPharmacistLicense: false,
  licenseNumber: "",
  licenseFileName: null,
  orgName: "",
  studentId: "",
  positionId: "",
};

/** 소속 유형을 바꿀 때 초기화되는 부분(소속 유형 자체를 뺀 나머지 전부). */
const resetProfileBelowAffiliation = {
  secondaryId: "",
  hasPharmacistLicense: false,
  licenseNumber: "",
  licenseFileName: null,
  orgName: "",
  studentId: "",
  positionId: "",
} as const;

/**
 * 약사 면허 칸 — 등장 조건은 소속·2차 선택에 따라 다르고, 여기서는 렌더만 한다.
 * 면허 칸이 사라지는 모든 경로(2차 변경·소속 변경·체크 해제)에서 이 컴포넌트가 통째로 언마운트되므로
 * FileUploadField가 내부에 들고 있는 파일명도 함께 초기화된다 — 별도 key/리셋이 필요 없다.
 */
function PharmacistLicenseField({
  licenseNumber,
  onLicenseNumberChange,
  onLicenseFileChange,
}: {
  licenseNumber: string;
  onLicenseNumberChange: (v: string) => void;
  onLicenseFileChange: (name: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel required>약사 면허번호</FieldLabel>
      <TextInput
        value={licenseNumber}
        onChange={(v) => onLicenseNumberChange(v.replace(/\D/g, ""))}
        placeholder="숫자만 입력"
      />
      <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">
        등록하시면 약사 회원 전용 QNA를 이용하실 수 있습니다.
      </p>
      <div className="pt-1">
        <FieldLabel>
          면허증 <span className="font-normal text-[#9aa3af]">(선택)</span>
        </FieldLabel>
        <div className="mt-2">
          <FileUploadField
            label="면허증 업로드"
            hint="나중에 마이페이지에서 등록하셔도 됩니다."
            accept=".pdf,.jpg,.jpeg,.png"
            onFileSelected={onLicenseFileChange}
          />
        </div>
      </div>
    </div>
  );
}

/** STEP2 프로필 묶음 — 소속 유형(13종) → 2차 선택 → 면허/소속명/학번/직급 순으로 조건부 전개된다. */
function ProfileGroup({
  value,
  onChangeAffiliation,
  onChangeSecondary,
  onChange,
}: {
  value: ProfileState;
  onChangeAffiliation: (id: MemberAffiliationId) => void;
  onChangeSecondary: (id: string) => void;
  onChange: <K extends keyof ProfileState>(key: K, next: ProfileState[K]) => void;
}) {
  const config = value.affiliationId ? affiliationConfig[value.affiliationId] : null;
  const showLicense = config ? shouldShowLicenseField(config, value.secondaryId, value.hasPharmacistLicense) : false;

  return (
    <div>
      <h2 className={GROUP_TITLE}>프로필 정보</h2>
      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <FieldLabel required>소속 유형</FieldLabel>
          <OptionButtonGroup
            options={memberAffiliationOptions}
            value={value.affiliationId}
            onChange={(id) => onChangeAffiliation(id as MemberAffiliationId)}
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
              value={value.secondaryId}
              onChange={onChangeSecondary}
              ariaLabel={config.secondary.label}
            />
          </div>
        ) : null}

        {config?.licenseMode === "checkbox" ? (
          <label className="flex items-center gap-2.5 border border-border bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={value.hasPharmacistLicense}
              onChange={(event) => onChange("hasPharmacistLicense", event.target.checked)}
              className="h-4 w-4 accent-[#111111]"
            />
            <span className="text-[13px] font-medium text-[#303946]">약사 면허를 보유하고 있습니다</span>
          </label>
        ) : null}

        {showLicense ? (
          <PharmacistLicenseField
            licenseNumber={value.licenseNumber}
            onLicenseNumberChange={(v) => onChange("licenseNumber", v)}
            onLicenseFileChange={(name) => onChange("licenseFileName", name)}
          />
        ) : null}

        {config?.orgNameLabel ? (
          <div className="space-y-2">
            <FieldLabel required>{config.orgNameLabel}</FieldLabel>
            <TextInput value={value.orgName} onChange={(v) => onChange("orgName", v)} placeholder={`${config.orgNameLabel}을 입력해 주세요`} />
          </div>
        ) : null}

        {config?.showStudentId ? (
          <div className="space-y-2">
            <FieldLabel>
              학번 <span className="font-normal text-[#9aa3af]">(선택)</span>
            </FieldLabel>
            <TextInput value={value.studentId} onChange={(v) => onChange("studentId", v)} placeholder="학번을 입력해 주세요" />
          </div>
        ) : null}

        {config?.showPosition ? (
          <div className="space-y-2">
            <FieldLabel htmlFor="signup-position">
              직급 <span className="font-normal text-[#9aa3af]">(선택)</span>
            </FieldLabel>
            <select
              id="signup-position"
              value={value.positionId}
              onChange={(event) => onChange("positionId", event.target.value)}
              className={SEL}
            >
              <option value="">선택 안 함</option>
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
  );
}

/** STEP 2 — 회원 정보. 아이디 입력란은 없다(이메일이 로그인 식별자). */
function MemberInfoStep({
  value,
  onChange,
  onPhoneChange,
  phoneVerified,
  onPhoneVerified,
  profile,
  onChangeAffiliation,
  onChangeSecondary,
  onChangeProfile,
}: {
  value: MemberInfoState;
  onChange: <K extends keyof MemberInfoState>(key: K, next: MemberInfoState[K]) => void;
  onPhoneChange: (next: string) => void;
  phoneVerified: boolean;
  onPhoneVerified: () => void;
  profile: ProfileState;
  onChangeAffiliation: (id: MemberAffiliationId) => void;
  onChangeSecondary: (id: string) => void;
  onChangeProfile: <K extends keyof ProfileState>(key: K, next: ProfileState[K]) => void;
}) {
  const passwordsMatch = value.password.trim() !== "" && value.password === value.passwordConfirm;

  return (
    <div className="space-y-8">
      <div>
        <h2 className={GROUP_TITLE}>계정 정보</h2>
        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <FieldLabel required>이름(실명)</FieldLabel>
            <TextInput value={value.name} onChange={(v) => onChange("name", v)} placeholder="이름을 입력해 주세요" />
          </div>
          <div className="space-y-2">
            <FieldLabel required>이메일</FieldLabel>
            <TextInput value={value.email} onChange={(v) => onChange("email", v)} placeholder="example@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
            <div className="space-y-2">
              <FieldLabel required>비밀번호</FieldLabel>
              <input
                type="password"
                value={value.password}
                onChange={(event) => onChange("password", event.target.value)}
                className={RAW_INPUT}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel required>비밀번호 확인</FieldLabel>
              <input
                type="password"
                value={value.passwordConfirm}
                onChange={(event) => onChange("passwordConfirm", event.target.value)}
                className={RAW_INPUT}
              />
              {value.passwordConfirm && !passwordsMatch ? (
                <p className="text-[12px] font-medium text-danger">비밀번호가 일치하지 않습니다.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className={GROUP_TITLE}>본인 확인</h2>
        <div className="mt-5">
          <PhoneVerificationField
            value={value.phone}
            onChange={onPhoneChange}
            isVerified={phoneVerified}
            onVerified={onPhoneVerified}
          />
        </div>
      </div>

      <ProfileGroup
        value={profile}
        onChangeAffiliation={onChangeAffiliation}
        onChangeSecondary={onChangeSecondary}
        onChange={onChangeProfile}
      />
    </div>
  );
}

/** STEP 1 — 약관 동의. 필수 3종을 모두 체크해야 다음으로 진행할 수 있다. */
function AgreementStep({
  value,
  onChange,
  onToggleAll,
}: {
  value: AgreementState;
  onChange: <K extends keyof AgreementState>(key: K, next: AgreementState[K]) => void;
  onToggleAll: (next: boolean) => void;
}) {
  const allAgreed = Object.values(value).every(Boolean);

  return (
    <div>
      <label className="flex items-center gap-2.5 py-1">
        <input
          type="checkbox"
          checked={allAgreed}
          onChange={(event) => onToggleAll(event.target.checked)}
          className="h-[18px] w-[18px] accent-[#111111]"
        />
        <span className="text-[15px] font-bold text-[#17202c]">전체 동의하기</span>
      </label>
      <div className="mt-3 border-t border-border" />

      <div className="mt-4 space-y-2">
        <AgreeCheckbox label="만 14세 이상입니다" required checked={value.age14} onChange={(v) => onChange("age14", v)} />
        <div>
          <AgreeCheckbox label="이용약관 동의" required checked={value.service} onChange={(v) => onChange("service", v)} />
          <TermsPreview />
        </div>
        <div>
          <AgreeCheckbox label="개인정보 수집·이용 동의" required checked={value.privacy} onChange={(v) => onChange("privacy", v)} />
          <TermsPreview />
        </div>
        <AgreeCheckbox
          label="광고성 정보 수신 — 이메일"
          checked={value.marketingEmail}
          onChange={(v) => onChange("marketingEmail", v)}
        />
        <AgreeCheckbox
          label="광고성 정보 수신 — 문자·알림톡"
          checked={value.marketingSms}
          onChange={(v) => onChange("marketingSms", v)}
        />
      </div>

      <div className="mt-3">
        <InlineInfoHint>지원 결과, 마감 안내 등 서비스 이용에 꼭 필요한 알림은 동의 여부와 관계없이 발송됩니다.</InlineInfoHint>
      </div>
    </div>
  );
}

/** 개인회원 가입 폼 — STEP1(약관 동의)만 실제 내용이 있고, STEP2·3은 아직 자리표시자다. */
export function PersonalSignupClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreements, setAgreements] = useState<AgreementState>(emptyAgreementState);
  const [memberInfo, setMemberInfo] = useState<MemberInfoState>(emptyMemberInfoState);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(emptyProfileState);

  const updateAgreement = <K extends keyof AgreementState>(key: K, next: AgreementState[K]) => {
    setAgreements((current) => ({ ...current, [key]: next }));
  };

  const toggleAllAgreements = (next: boolean) => {
    setAgreements({ age14: next, service: next, privacy: next, marketingEmail: next, marketingSms: next });
  };

  const updateMemberInfo = <K extends keyof MemberInfoState>(key: K, next: MemberInfoState[K]) => {
    setMemberInfo((current) => ({ ...current, [key]: next }));
  };

  /** 번호가 바뀌면 인증 상태를 초기화한다. */
  const updatePhone = (next: string) => {
    setMemberInfo((current) => ({ ...current, phone: next }));
    setPhoneVerified(false);
  };

  const canProceedFromAgreement = agreements.age14 && agreements.service && agreements.privacy;

  /** 소속 유형을 바꾸면 그 아래 항목(2차 선택·면허·소속명·학번·직급)을 전부 초기화한다. */
  const changeAffiliation = (id: MemberAffiliationId) => {
    setProfile({ ...emptyProfileState, ...resetProfileBelowAffiliation, affiliationId: id });
  };

  /** 2차 선택을 바꿔 면허 칸이 사라지는 경우 면허번호·면허증도 함께 비운다. */
  const changeSecondary = (id: string) => {
    setProfile((current) => {
      if (!current.affiliationId) return current;
      const config = affiliationConfig[current.affiliationId];
      const stillShowsLicense = shouldShowLicenseField(config, id, current.hasPharmacistLicense);
      return {
        ...current,
        secondaryId: id,
        licenseNumber: stillShowsLicense ? current.licenseNumber : "",
        licenseFileName: stillShowsLicense ? current.licenseFileName : null,
      };
    });
  };

  const updateProfile = <K extends keyof ProfileState>(key: K, next: ProfileState[K]) => {
    setProfile((current) => ({ ...current, [key]: next }));
  };

  const affiliation = profile.affiliationId ? affiliationConfig[profile.affiliationId] : null;
  const showLicenseField = affiliation
    ? shouldShowLicenseField(affiliation, profile.secondaryId, profile.hasPharmacistLicense)
    : false;

  const canProceedFromProfile = (() => {
    if (!affiliation) return false;
    if (affiliation.secondary && !profile.secondaryId) return false;
    if (affiliation.orgNameLabel && !profile.orgName.trim()) return false;
    if (showLicenseField && !profile.licenseNumber.trim()) return false;
    return true;
  })();

  const canProceedFromMemberInfo =
    Boolean(memberInfo.name.trim()) &&
    Boolean(memberInfo.email.trim()) &&
    memberInfo.password.trim() !== "" &&
    memberInfo.password === memberInfo.passwordConfirm &&
    phoneVerified &&
    canProceedFromProfile;

  return (
    <SignupStepShell
      step={step}
      labels={STEP_LABELS}
      /* STEP3(완료)는 배지·제목까지 가운데 정렬해야 해서 헤더를 본문 안에서 직접 구성한다 — 셸에는 빈 값을 넘겨 끈다. */
      eyebrow={step === 3 ? "" : "개인회원 가입"}
      title={step === 3 ? "" : step === 1 ? "약관에 동의해 주세요" : "회원 정보를 입력해 주세요"}
      subtitle={
        step === 3
          ? ""
          : step === 1
            ? "더파마뉴스와 더파마 리크루트를 함께 이용하실 수 있습니다."
            : "입력하신 정보로 맞춤 채용 정보를 추천해 드립니다."
      }
    >
      {step === 1 ? <AgreementStep value={agreements} onChange={updateAgreement} onToggleAll={toggleAllAgreements} /> : null}
      {step === 2 ? (
        <MemberInfoStep
          value={memberInfo}
          onChange={updateMemberInfo}
          onPhoneChange={updatePhone}
          phoneVerified={phoneVerified}
          onPhoneVerified={() => setPhoneVerified(true)}
          profile={profile}
          onChangeAffiliation={changeAffiliation}
          onChangeSecondary={changeSecondary}
          onChangeProfile={updateProfile}
        />
      ) : null}
      {step === 3 ? <SignupDoneStep hasPharmacistLicense={Boolean(profile.licenseNumber.trim())} /> : null}

      {step === 1 ? (
        <>
          <div className="mt-9 flex justify-end">
            <Button type="button" variant="gradient" disabled={!canProceedFromAgreement} onClick={() => setStep(2)}>
              다음
            </Button>
          </div>
          <p className="mt-6 text-center text-[13px] text-[#68717e]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-[#111111] underline underline-offset-2">
              로그인
            </Link>
          </p>
        </>
      ) : null}
      {step === 2 ? (
        <div className="mt-9 flex justify-between gap-3">
          <Button type="button" variant="secondary" onClick={() => setStep(1)}>
            이전
          </Button>
          <Button type="button" variant="gradient" disabled={!canProceedFromMemberInfo} onClick={() => setStep(3)}>
            가입하기
          </Button>
        </div>
      ) : null}
    </SignupStepShell>
  );
}
