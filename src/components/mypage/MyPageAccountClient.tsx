"use client";

import { useState, type ReactNode } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { PhoneVerificationField } from "@/components/signup/PhoneVerificationField";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  FieldLabel,
  FormActionButton,
  SectionCard,
  TextInput,
  PROFILE_TEXT_FIELD_WIDTH,
} from "@/components/business/BusinessFormControls";
import { mockPersonalMember } from "@/data/personalMember";

/** 라벨-값 한 줄. 기업 "계정·노출 설정"(BusinessCompanyProfileClient §6)과 같은 규격으로,
 * 좁은 화면에서는 라벨이 값 위로 올라간다. 읽기 전용 칸과 편집 칸이 섞여도 줄 간격이 흐트러지지 않는다. */
function AccountRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4 max-[480px]:grid-cols-1 max-[480px]:items-start max-[480px]:gap-2">
      <FieldLabel>{label}</FieldLabel>
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
 * 개인 회원정보 화면 A회차 — 분기 없는 3개 섹션(계정 정보·본인 확인·광고성 정보 수신)까지.
 * 소속 유형 13종과 약사 인증 분기는 B회차에서 붙인다.
 *
 * 목업이라 저장하지 않는다 — 입력값은 이 컴포넌트의 상태로만 유지되고 이탈하면 사라진다.
 */
export function MyPageAccountClient() {
  const [name, setName] = useState(mockPersonalMember.name);
  const [email, setEmail] = useState(mockPersonalMember.email);
  const [phone, setPhone] = useState(mockPersonalMember.phone);
  const [phoneVerified, setPhoneVerified] = useState(mockPersonalMember.phoneVerified);
  const [marketingEmail, setMarketingEmail] = useState(mockPersonalMember.marketingEmail);
  const [marketingSms, setMarketingSms] = useState(mockPersonalMember.marketingSms);

  /** 번호가 바뀌면 인증 상태를 초기화한다 — 가입 폼(PersonalSignupClient)의 updatePhone과 같은 규칙. */
  const updatePhone = (next: string) => {
    setPhone(next);
    setPhoneVerified(false);
  };

  const handleChangePassword = () => {
    // TODO: 비밀번호 변경 모달/로직은 이번 범위 아님 — 기업 기관정보 관리와 같이 버튼 자리만 마련
  };

  const handleSave = () => {
    // TODO: 목업 — 저장 파이프라인이 없어 아무것도 하지 않는다. 값은 화면 상태로만 유지된다.
  };

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "회원정보" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">회원정보</h1>
      <p className="mt-2.5 text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        계정 정보와 수신 설정을 관리합니다.
      </p>

      <div className="mt-7 space-y-5">
        {/* §1 계정 정보 */}
        <SectionCard id="account" title="계정 정보">
          <div className={`${PROFILE_TEXT_FIELD_WIDTH} space-y-4`}>
            <AccountRow label="아이디">
              <TextInput value={mockPersonalMember.accountId} disabled />
            </AccountRow>
            <AccountRow label="이름">
              <TextInput value={name} onChange={setName} placeholder="이름을 입력해 주세요" />
            </AccountRow>
            <AccountRow label="이메일">
              <TextInput value={email} onChange={setEmail} placeholder="example@email.com" />
            </AccountRow>
            <AccountRow label="비밀번호">
              <div className="flex items-center gap-2">
                <TextInput value="••••••••" disabled />
                <FormActionButton onClick={handleChangePassword}>비밀번호 변경</FormActionButton>
              </div>
            </AccountRow>
          </div>
        </SectionCard>

        {/* §2 본인 확인 */}
        <SectionCard id="identity" title="본인 확인">
          <div className={PROFILE_TEXT_FIELD_WIDTH}>
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
        </SectionCard>

        {/* §3 광고성 정보 수신. 서비스 알림 수신 설정은 /mypage/notifications/settings가 따로 소유한다 */}
        <SectionCard id="marketing" title="광고성 정보 수신">
          <div className={`${PROFILE_TEXT_FIELD_WIDTH} divide-y divide-[#eef1f4]`}>
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
          <p className="mt-4 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">
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
