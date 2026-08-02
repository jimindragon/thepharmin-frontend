"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgreeCheckbox } from "@/components/business/signup/AccountCreationStep";
import { PhoneVerificationField } from "@/components/signup/PhoneVerificationField";
import { InlineInfoHint } from "@/components/shared/InlineInfoHint";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { useMemberMigration } from "@/hooks/useMemberMigration";

/**
 * 기존 더파마뉴스 회원의 통합 약관 재동의 화면.
 *
 * 가입 폼과 달리 한 화면짜리라 스텝 표시기(SignupStepShell)를 쓰지 않고 카드만 직접 구성한다.
 * 폭은 720px(가입 폼)보다 좁은 560px — 입력이 휴대폰 번호 하나뿐이다.
 *
 * 이 화면으로 보내는 연결(다른 화면의 리다이렉트·링크)은 이번 범위가 아니다.
 */

interface MigrationAgreements {
  service: boolean;
  privacy: boolean;
  marketingEmail: boolean;
  marketingSms: boolean;
}

/** 가입 폼 STEP1과 달리 "만 14세 이상"이 없다 — 기존 회원은 가입 시 이미 확인했다. */
const emptyAgreements: MigrationAgreements = {
  service: false,
  privacy: false,
  marketingEmail: false,
  marketingSms: false,
};

/** 동의 화면과 거부 안내가 같은 폭·같은 자리에 놓이도록 껍데기를 공유한다. */
function MigrationCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[560px] border border-border bg-white p-10 max-[560px]:p-6">{children}</div>
    </main>
  );
}

/**
 * 동의를 미룬 사람에게 보여주는 안내. 별도 라우트를 만들지 않고 같은 화면 안에서 전환한다 —
 * 되돌아오는 길이 뒤로가기 한 번이어야 하고, URL에 "거부" 상태가 남지 않는 편이 낫다.
 *
 * 큰 버튼은 "돌아가기"다. 탈퇴는 작은 링크로만 둔다 — 약관 재동의는 탈퇴 유도 화면이 아니다.
 */
function DeclineNotice({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Eyebrow>약관 개정 안내</Eyebrow>
      <h1 className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.02em] text-[#17202c]">
        동의하지 않으시면 회원 서비스를 이용하실 수 없습니다
      </h1>
      {/* 동의 화면 머리말과 같은 규칙 — 한 문단 안에서 <br />로만 끊어 세 줄의 간격을 같게 둔다. */}
      <p className="mt-4 break-keep text-[15px] font-normal leading-[1.7] text-[#68717e]">
        개정된 약관은 기존 약관을 대체합니다.
        <br />
        동의하지 않으신 상태로는 로그인이 필요한 기능을 이용하실 수 없습니다.
        <br />
        로그인 없이 보실 수 있는 기사는 그대로 이용하실 수 있습니다.
      </p>

      <div className="mt-8">
        <Button type="button" variant="gradient" className="w-full" onClick={onBack}>
          돌아가서 다시 보기
        </Button>
      </div>

      {/* 탈퇴 절차는 이번 범위가 아니다 — 자리만 두고 동작은 연결하지 않는다. */}
      <p className="mt-5 text-center">
        <a href="#" className="text-[13px] font-normal text-[#8a94a3] underline underline-offset-2 transition hover:text-[#4f5967]">
          회원 탈퇴를 원하시나요
        </a>
      </p>
    </>
  );
}

export function MigrationClient({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { markMigrated } = useMemberMigration();

  const [declined, setDeclined] = useState(false);
  const [agreements, setAgreements] = useState<MigrationAgreements>(emptyAgreements);
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const allAgreed = Object.values(agreements).every(Boolean);

  const updateAgreement = <K extends keyof MigrationAgreements>(key: K, next: MigrationAgreements[K]) => {
    setAgreements((current) => ({ ...current, [key]: next }));
  };

  const toggleAllAgreements = (next: boolean) => {
    setAgreements({ service: next, privacy: next, marketingEmail: next, marketingSms: next });
  };

  // 번호가 바뀌면 인증 완료를 되돌린다 — PhoneVerificationField가 부모에게 기대하는 방식(가입 폼 STEP2와 동일).
  const handlePhoneChange = (next: string) => {
    setPhone(next);
    setPhoneVerified(false);
  };

  /** 필수 동의 2종 + 휴대폰 인증. 선택 항목(광고성 정보)은 진행 조건이 아니다. */
  const canSubmit = agreements.service && agreements.privacy && phoneVerified;

  /**
   * 여기서 전환 완료를 기록하고 소속 확인으로 넘긴다.
   *
   * 소속 확인보다 먼저 기록하는 것이 맞다 — 소속 확인은 건너뛸 수 있는 단계라, 거기서 기록했다면
   * "나중에 하기"를 누른 사람이 영영 미전환으로 남아 다음 방문에 재동의를 또 보게 된다.
   * 이 시점부터 MigrationGuard도 더는 이 사람을 붙잡지 않는다.
   *
   * redirect는 그대로 넘긴다 — 원래 가려던 곳은 소속 확인을 마친 뒤에 도착할 자리다.
   */
  const handleSubmit = () => {
    markMigrated();
    router.push(`/migration/affiliation?redirect=${encodeURIComponent(redirectTo)}`);
  };

  if (declined) {
    return (
      <MigrationCard>
        <DeclineNotice onBack={() => setDeclined(false)} />
      </MigrationCard>
    );
  }

  return (
    <MigrationCard>
      <Eyebrow>약관 개정 안내</Eyebrow>
      <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">약관이 개정되었습니다</h1>
      {/*
        세 문장을 한 문단 안에 두고 <br />로만 끊는다. 문단을 나누면 그 경계에만 mt-4가 얹혀
        1·2줄 사이와 2·3줄 사이의 간격이 달라진다 — 세 줄 모두 leading-[1.7] 하나로 통일한다.
        break-keep — 한국어는 기본값이면 "개정되/어"처럼 단어 중간에서도 줄이 갈린다.
      */}
      <p className="mt-3 break-keep text-[15px] font-normal leading-[1.7] text-[#68717e]">
        더파마뉴스가 채용 서비스 &lsquo;더파마 리크루트&rsquo;를 함께 운영하게 되었습니다.
        <br />
        이에 따라 이용약관과 개인정보 처리 안내가 개정되어, 재동의를 받고 있습니다.
        <br />
        기존에 이용하시던 뉴스 서비스는 그대로 이용하실 수 있습니다.
      </p>

      <div className="mt-8">
        <label className="flex items-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(event) => toggleAllAgreements(event.target.checked)}
            className="h-[18px] w-[18px] accent-[#111111]"
          />
          <span className="text-[15px] font-bold text-[#17202c]">전체 동의하기</span>
        </label>
        <div className="mt-3 border-t border-border" />

        <div className="mt-4 space-y-2">
          {/*
            "전문 보기"를 체크박스 줄 안쪽 오른쪽 끝에 겹쳐 둔다 — 형제로 나란히 두면 그 줄만
            좁아져 아래 줄들과 오른쪽 끝이 어긋난다(AgreeCheckbox가 테두리 있는 전폭 박스다).
            가입 폼 STEP1과 같은 마크업이지만 공유 컴포넌트로 빼지는 않았다 — 줄 하나 수준이다.
          */}
          <div className="relative">
            <AgreeCheckbox label="이용약관 동의" required checked={agreements.service} onChange={(v) => updateAgreement("service", v)} />
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="이용약관 전문 보기 (새 창)"
              onClick={(event) => event.stopPropagation()}
              className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-[12px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
            >
              전문 보기
            </Link>
          </div>
          <div className="relative">
            <AgreeCheckbox
              label="개인정보 수집·이용 동의"
              required
              checked={agreements.privacy}
              onChange={(v) => updateAgreement("privacy", v)}
            />
            <Link
              href="/terms/privacy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="개인정보 수집·이용 동의 전문 보기 (새 창)"
              onClick={(event) => event.stopPropagation()}
              className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-[12px] font-medium text-[#6f7783] underline underline-offset-2 transition hover:text-[#111111]"
            >
              전문 보기
            </Link>
          </div>
          <AgreeCheckbox
            label="광고성 정보 수신 — 이메일"
            checked={agreements.marketingEmail}
            onChange={(v) => updateAgreement("marketingEmail", v)}
          />
          <AgreeCheckbox
            label="광고성 정보 수신 — 문자·알림톡"
            checked={agreements.marketingSms}
            onChange={(v) => updateAgreement("marketingSms", v)}
          />
        </div>

        <div className="mt-3">
          <InlineInfoHint>지원 결과, 공고 마감 등 서비스 이용에 필요한 안내는 수신 동의 여부와 관계없이 발송됩니다.</InlineInfoHint>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#1f2733]">휴대폰 인증</h2>
        {/*
          "번호를 등록해 주세요"는 바로 아래 입력칸이 이미 말하고 있어 뺐다.
          남은 안내는 필드 위가 아니라 아래에 둔다 — 무엇을 하라는 지시가 아니라 "이 번호가 어떻게
          쓰이는가"라 입력하고 나서 읽어도 되는 문장이고, 위 광고성 정보 안내와 같은 성격이다.
        */}
        <div className="mt-4">
          <PhoneVerificationField
            value={phone}
            onChange={handlePhoneChange}
            isVerified={phoneVerified}
            onVerified={() => setPhoneVerified(true)}
          />
        </div>
        <div className="mt-3">
          <InlineInfoHint>
            휴대폰 번호는 본인 확인과 서비스 안내에 사용되며, 광고성 정보는 수신에 동의한 경우에만 발송됩니다.
          </InlineInfoHint>
        </div>
      </div>

      <div className="mt-8">
        <Button type="button" variant="gradient" className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          동의하고 계속하기
        </Button>
      </div>

      <p className="mt-5 text-center">
        <button
          type="button"
          onClick={() => setDeclined(true)}
          className="text-[13px] font-normal text-[#8a94a3] underline underline-offset-2 transition hover:text-[#4f5967]"
        >
          동의하지 않으면 어떻게 되나요
        </button>
      </p>
    </MigrationCard>
  );
}
