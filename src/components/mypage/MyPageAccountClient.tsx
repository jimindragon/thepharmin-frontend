"use client";

import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { PhoneVerificationField } from "@/components/signup/PhoneVerificationField";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { FieldLabel, FormActionButton, SectionCard, TextInput } from "@/components/business/BusinessFormControls";
import { FileUploadField } from "@/components/business/signup/FileUploadField";
import { StatusPill } from "@/components/business/table/StatusPill";
import { SEL } from "@/components/job-registration/fieldClasses";
import {
  affiliationConfig,
  getStudentGradeField,
  memberAffiliationOptions,
  memberPositionOptions,
  shouldShowLicenseField,
  shouldShowPreliminaryPharmacist,
  upcomingPharmacistExamExpiry,
  GRADE_BASE_YEAR,
  type MemberAffiliationId,
  type MemberOption,
  type StudentGrade,
} from "@/config/memberAffiliation";
import { mockPersonalMember } from "@/data/personalMember";

/**
 * 짧은 입력칸 2개를 나란히 놓는 그리드. 기업 기관정보 관리(BusinessCompanyProfileClient)의
 * 같은 이름 상수와 값이 같다 — 그쪽이 모듈 내부 상수라 import할 수 없어 여기 둔다.
 * 칸이 홀수로 남으면 왼쪽만 차고 오른쪽은 빈다(의도된 모습).
 */
const FIELD_GRID_2COL = "grid grid-cols-2 gap-4 max-[640px]:grid-cols-1";

/**
 * 라벨 위 · 입력칸 아래 한 덩어리. 이 화면의 모든 섹션이 같은 배치를 쓰므로
 * 입력칸의 좌측 시작점이 섹션을 건너뛰어도 어긋나지 않는다.
 */
function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel required={required} htmlFor={htmlFor}>
        {label}
      </FieldLabel>
      {children}
    </div>
  );
}

/** 광고성 수신 한 줄. 서비스 알림(/mypage/notifications/settings)의 목록 리듬을 따른다. */
function MarketingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[#17202c]">{label}</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-[#68717e]">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

/**
 * 버튼 나열 단일선택(소속 유형 13종·2차 선택·학년).
 *
 * ⚠️ 가입 폼(PersonalSignupClient의 OptionButtonGroup)·소속 확인 화면(AffiliationConfirmClient)과
 * 같은 마크업의 세 번째 사본이다. 앞의 둘이 모두 모듈 내부 함수라 export되어 있지 않고 두 파일 모두
 * 무변경이 원칙이라 공용으로 뺄 수 없었다 — AffiliationConfirmClient 상단의 "합류 지점" 메모에
 * 적힌 정리를 할 때 이 파일도 함께 걷어낼 것.
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
 * 개인 회원정보 화면 — 계정 정보·본인 확인·광고성 정보 수신(A회차)에
 * 소속 정보·약사 인증(B회차)까지.
 *
 * 소속 13종의 분기 규칙은 memberAffiliation.ts를 정본으로 그대로 쓴다(재정의 없음).
 * 목업이라 저장하지 않는다 — 입력값은 이 컴포넌트의 상태로만 유지되고 이탈하면 사라진다.
 */
export function MyPageAccountClient() {
  const [name, setName] = useState(mockPersonalMember.name);
  const [email, setEmail] = useState(mockPersonalMember.email);
  const [phone, setPhone] = useState(mockPersonalMember.phone);
  const [phoneVerified, setPhoneVerified] = useState(mockPersonalMember.phoneVerified);
  const [marketingEmail, setMarketingEmail] = useState(mockPersonalMember.marketingEmail);
  const [marketingSms, setMarketingSms] = useState(mockPersonalMember.marketingSms);

  const [affiliationId, setAffiliationId] = useState<MemberAffiliationId | "">(mockPersonalMember.affiliationId);
  const [secondaryId, setSecondaryId] = useState(mockPersonalMember.secondaryId);
  const [orgName, setOrgName] = useState(mockPersonalMember.orgName);
  const [studentGrade, setStudentGrade] = useState<StudentGrade | null>(mockPersonalMember.studentGrade);
  const [positionId, setPositionId] = useState(mockPersonalMember.positionId);
  const [hasPharmacistLicense, setHasPharmacistLicense] = useState(mockPersonalMember.hasPharmacistLicense);
  const [licenseNumber, setLicenseNumber] = useState(mockPersonalMember.licenseNumber);
  const [licenseFileName, setLicenseFileName] = useState(mockPersonalMember.licenseFileName);
  const [preliminaryFileName, setPreliminaryFileName] = useState(mockPersonalMember.preliminaryPharmacistFileName);

  const config = affiliationId ? affiliationConfig[affiliationId] : null;
  const showLicenseField = config ? shouldShowLicenseField(config, secondaryId, hasPharmacistLicense) : false;
  /** 학년 선택지·안내는 전공 계열(2차 선택)에 따라 갈린다 — 약학 6년 / 의학·간호 예과·본과 / 나머지 4년. */
  const gradeField = getStudentGradeField(secondaryId);
  /** 예비약사 인증은 약학 6학년에만 나온다. 판정은 memberAffiliation.ts가 정본이다. */
  const showPreliminaryPharmacist = config
    ? shouldShowPreliminaryPharmacist(config, secondaryId, studentGrade)
    : false;
  /**
   * §5는 안에 실제로 들어갈 것이 있을 때만 렌더한다 — checkbox 모드는 체크박스가 항상 있고,
   * auto 모드는 2차 선택이 면허 직군일 때만, 학생(none)은 6학년일 때만 내용이 생긴다.
   * 조건을 licenseMode만으로 잡으면 약국에서 직무를 고르기 전에 제목만 있는 빈 카드가 남는다.
   */
  const showLicenseSection =
    config?.licenseMode === "checkbox" || showLicenseField || showPreliminaryPharmacist;

  /** 면허번호·면허증을 함께 비운다. 칸이 사라지는 모든 경로에서 부른다 — 화면에서 사라진 값이 저장되지 않게. */
  const clearLicense = () => {
    setLicenseNumber("");
    setLicenseFileName(null);
  };

  /** 번호가 바뀌면 인증 상태를 초기화한다 — 가입 폼(PersonalSignupClient)의 updatePhone과 같은 규칙. */
  const updatePhone = (next: string) => {
    setPhone(next);
    setPhoneVerified(false);
  };

  /** 소속 유형을 바꾸면 그 아래 항목(2차 선택·소속명·학년·직급·면허)을 전부 초기화한다. */
  const changeAffiliation = (id: MemberAffiliationId) => {
    setAffiliationId(id);
    setSecondaryId("");
    setOrgName("");
    setStudentGrade(null);
    setPositionId("");
    setHasPharmacistLicense(false);
    clearLicense();
    setPreliminaryFileName(null);
  };

  /**
   * 2차 선택을 바꿔 면허 칸이 사라지는 경우(auto 모드) 면허번호·면허증도 함께 비운다.
   * 전공(학생의 2차 선택)이 바뀌면 학년과 예비약사 인증도 비운다 — 학년 선택지가 전공마다
   * 갈려 고른 값이 새 목록에 없거나 다른 학년을 가리키게 된다. 가입 폼의 changeSecondary와 같은 규칙.
   */
  const changeSecondary = (id: string) => {
    setSecondaryId(id);
    if (config && !shouldShowLicenseField(config, id, hasPharmacistLicense)) clearLicense();
    // 같은 값을 다시 눌렀을 때는 비우지 않는다.
    if (config?.showGrade && id !== secondaryId) {
      setStudentGrade(null);
      setPreliminaryFileName(null);
    }
  };

  /**
   * 체크를 풀면 면허 칸이 사라지므로 값도 함께 비운다.
   * 가입 폼은 언마운트에만 기대 값을 남겨 두지만(진행 조건에서 안 보므로 무해), 이 화면은 상태가 곧
   * 저장 대상이라 2차 선택 변경과 같은 "사라지면 비운다" 규칙으로 맞춘다.
   */
  const changeHasLicense = (next: boolean) => {
    setHasPharmacistLicense(next);
    if (!next) clearLicense();
  };

  /** 예비약사 인증 칸이 사라지는 학년으로 옮기면 등록해 둔 재학증명서도 함께 비운다. */
  const changeGrade = (grade: number) => {
    const next = { grade, baseYear: GRADE_BASE_YEAR };
    setStudentGrade(next);
    if (!config || !shouldShowPreliminaryPharmacist(config, secondaryId, next)) setPreliminaryFileName(null);
  };

  const handleChangePassword = () => {
    // TODO: 비밀번호 변경 모달/로직은 이번 범위 아님 — 기업 기관정보 관리와 같이 버튼 자리만 마련
  };

  const handleSave = () => {
    // TODO: 목업 — 저장 파이프라인이 없어 아무것도 하지 않는다. 값은 화면 상태로만 유지된다.
  };

  return (
    <MyPageShell>
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "회원정보" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">회원정보</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        계정 정보와 수신 설정을 관리합니다.
      </p>

      <div className="mt-7 space-y-5">
        {/* §1 계정 정보 */}
        <SectionCard id="account" title="계정 정보">
          <div className={FIELD_GRID_2COL}>
            <Field label="아이디">
              <TextInput value={mockPersonalMember.accountId} disabled />
            </Field>
            <Field label="이름">
              <TextInput value={name} onChange={setName} placeholder="이름을 입력해 주세요" />
            </Field>
            <Field label="이메일">
              <TextInput value={email} onChange={setEmail} placeholder="example@email.com" />
            </Field>
            <Field label="비밀번호">
              <div className="flex items-center gap-2">
                <TextInput value="••••••••" disabled />
                <FormActionButton onClick={handleChangePassword}>비밀번호 변경</FormActionButton>
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* §2 본인 확인 */}
        <SectionCard id="identity" title="본인 확인">
          {/* 번호 하나뿐인 섹션이라 2열 그리드의 왼쪽 칸에 맞춘다 — 다른 섹션의 첫 칸과 폭·좌우 끝이 같아진다.
              입력칸과 "인증번호 받기" 버튼은 PhoneVerificationField가 한 행으로 묶어 두므로 그 칸 안에서 나뉜다. */}
          <div className={FIELD_GRID_2COL}>
            <div>
              <PhoneVerificationField
                value={phone}
                onChange={updatePhone}
                isVerified={phoneVerified}
                onVerified={() => setPhoneVerified(true)}
              />
            {/*
              PhoneVerificationField는 인증이 끝나면 입력칸과 "인증번호 받기"를 함께 잠근다 — 가입 폼에서는
              방금 인증한 번호를 되돌릴 이유가 없어 맞는 동작이지만, 회원정보에서는 그대로 두면 번호를
              영영 바꿀 수 없다. 잠금을 푸는 버튼을 이 화면 쪽에 둔다(공유 컴포넌트는 그대로).
            */}
              {phoneVerified ? (
                <div className="mt-3">
                  <FormActionButton onClick={() => setPhoneVerified(false)}>번호 변경</FormActionButton>
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>

        {/* §3 소속 정보. 어떤 칸이 나오는지는 memberAffiliation.ts의 affiliationConfig가 전부 정한다 */}
        <SectionCard id="affiliation" title="소속 정보" description="소속이 바뀌면 수정해 주세요. 공고 추천에 활용됩니다.">
          <div className="space-y-5">
            {/* 칩 그룹은 선택지가 13개·14개라 카드 안쪽 폭을 다 쓴다 — 좁히면 줄 수만 늘어난다. */}
            <Field label="소속 유형" required>
              <OptionButtonGroup
                options={memberAffiliationOptions}
                value={affiliationId}
                onChange={(id) => changeAffiliation(id as MemberAffiliationId)}
                ariaLabel="소속 유형"
              />
            </Field>

            {config?.secondary ? (
              <Field label={config.secondary.label} required>
                {config.secondary.hint ? (
                  <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">{config.secondary.hint}</p>
                ) : null}
                <OptionButtonGroup
                  options={config.secondary.options}
                  value={secondaryId}
                  onChange={changeSecondary}
                  ariaLabel={config.secondary.label}
                />
              </Field>
            ) : null}

            {/*
              소속명과 직급을 한 줄에 둔다. 학년(학생 전용)이 사이에 끼지 않는 이유는 두 값이 배타적이기
              때문이다 — 학년이 나오는 소속은 학생뿐이고 학생은 showPosition이 false다. 그래서 학생일 때
              이 그리드에는 학교명만 남아 왼쪽 칸을 차지하고, 학년은 아래 줄에 이어진다.
            */}
            {config?.orgNameLabel || config?.showPosition ? (
              <div className={FIELD_GRID_2COL}>
                {config.orgNameLabel ? (
                  <Field label={config.orgNameLabel} required>
                    <TextInput value={orgName} onChange={setOrgName} placeholder={`${config.orgNameLabel}을 입력해 주세요`} />
                  </Field>
                ) : null}

                {config.showPosition ? (
                  <Field label="직급" required htmlFor="account-position">
                    <select
                      id="account-position"
                      value={positionId}
                      onChange={(event) => setPositionId(event.target.value)}
                      className={SEL}
                    >
                      <option value="">선택해 주세요</option>
                      {memberPositionOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
              </div>
            ) : null}

            {config?.showGrade ? (
              <Field label="학년" required>
                <OptionButtonGroup
                  options={gradeField.options}
                  value={studentGrade ? String(studentGrade.grade) : ""}
                  onChange={(id) => changeGrade(Number(id))}
                  ariaLabel="학년"
                />
                <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">{gradeField.hint}</p>
              </Field>
            ) : null}
          </div>
        </SectionCard>

        {/* §4 약사 인증. 면허 칸도 예비약사 칸도 나오지 않는 상태에서는 섹션 자체를 렌더하지 않는다 */}
        {showLicenseSection ? (
          <SectionCard
            id="license"
            title="약사 인증"
            /* 학생(예비약사)은 면허 칸이 아예 없으므로 면허 문구가 맞지 않는다 — 둘은 배타적이라 삼항으로 갈린다. */
            description={
              showPreliminaryPharmacist
                ? "예비약사 인증을 등록하면 약사 회원 전용 QNA를 이용하실 수 있습니다."
                : "약사 면허 정보를 등록하면 약사 인증 회원으로 표시됩니다."
            }
          >
            <div className="space-y-5">
              {config?.licenseMode === "checkbox" ? (
                <label className="flex items-center gap-2.5 border border-border bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={hasPharmacistLicense}
                    onChange={(event) => changeHasLicense(event.target.checked)}
                    className="h-4 w-4 accent-[#111111]"
                  />
                  <span className="text-[13px] font-medium text-[#303946]">약사 면허를 보유하고 있습니다</span>
                </label>
              ) : null}

              {showLicenseField ? (
                <>
                  {/* 면허번호는 짧은 값이라 반쪽 칸에 둔다. 오른쪽이 비는 것은 의도된 모습이다. */}
                  <div className={FIELD_GRID_2COL}>
                    {/* 한약사를 골라도 라벨은 "약사 면허번호"로 고정 — 가입 폼과 같은 한계를 그대로 따른다. */}
                    <Field label="약사 면허번호" required>
                      <TextInput
                        value={licenseNumber}
                        onChange={(v) => setLicenseNumber(v.replace(/\D/g, ""))}
                        placeholder="숫자만 입력"
                      />
                      {licenseNumber.trim() ? (
                        <div className="pt-0.5">
                          <StatusPill
                            tone={licenseFileName ? "progress" : "idle"}
                            label={licenseFileName ? "검토 대기" : "면허증 미등록"}
                          />
                        </div>
                      ) : null}
                    </Field>
                  </div>

                  {/* 업로드 블록은 점선 드롭존이라 반쪽 폭에서는 문구가 끊긴다 — 전체 폭으로 둔다. */}
                  <Field label={<>면허증 <span className="font-normal text-[#9aa3af]">(선택)</span></>}>
                    <FileUploadField
                      label="면허증 업로드"
                      hint="등록하시면 약사 인증 검토가 시작됩니다."
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelected={setLicenseFileName}
                    />
                  </Field>
                </>
              ) : null}

              {showPreliminaryPharmacist ? (
                <div className="space-y-2">
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#1f2733]">
                    예비약사 인증 <span className="font-normal text-[#9aa3af]">(선택)</span>
                  </h3>
                  {/* 카드 설명이 이미 "무엇을 얻는지"를 말하므로 여기서는 조건과 유효기간만 짚는다. */}
                  <p className="text-[12px] font-normal leading-[1.55] text-[#8a94a3]">
                    졸업예정자만 등록하실 수 있습니다. 승인되면 {upcomingPharmacistExamExpiry()}까지 유효합니다.
                  </p>
                  {/* 학생증은 받지 않는다 — 대부분 학번과 이름만 있고 현재 학년이 없어 6학년인지 확인할 수 없다. */}
                  <div className="pt-1">
                    <FileUploadField
                      label="재학증명서"
                      hint="학년이 표시된 재학증명서를 등록해 주세요."
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelected={setPreliminaryFileName}
                    />
                  </div>
                  {preliminaryFileName ? (
                    <div className="pt-0.5">
                      <StatusPill tone="progress" label="검토 대기" />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>
        ) : null}

        {/* §5 광고성 정보 수신. 서비스 알림 수신 설정은 /mypage/notifications/settings가 따로 소유한다 */}
        <SectionCard id="marketing" title="광고성 정보 수신">
          {/* 토글 행·구분선은 카드 안쪽 폭을 채운다 — 토글이 다른 섹션 입력칸의 우측 끝과 같은 x에 선다. */}
          <div className="divide-y divide-[#eef1f4]">
            <MarketingRow
              label="이메일 수신"
              description="채용 소식, 이벤트 등 광고성 정보를 이메일로 받아봅니다."
              checked={marketingEmail}
              onChange={setMarketingEmail}
            />
            <MarketingRow
              label="문자·알림톡 수신"
              description="채용 소식, 이벤트 등 광고성 정보를 문자·알림톡으로 받아봅니다."
              checked={marketingSms}
              onChange={setMarketingSms}
            />
          </div>
          {/* 보조 문구만 폭을 제한한다 — 전체 폭으로 두면 한 줄로 길게 늘어져 읽기 어렵다. */}
          <p className="mt-4 max-w-[560px] text-[13px] font-normal leading-[1.6] text-[#8a94a3]">
            지원 결과, 마감 안내 등 서비스 이용에 꼭 필요한 알림은 동의 여부와 관계없이 발송됩니다.
          </p>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="button" variant="gradient" onClick={handleSave}>
            저장하기
          </Button>
        </div>
      </div>
    </MyPageShell>
  );
}
