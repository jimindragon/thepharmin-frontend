import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Typography";
import { SignupStepIndicator } from "@/components/business/signup/SignupStepIndicator";
import type { OrgTrack } from "@/data/businessCompanyProfile";

/** STEP B(기관 인증/담당자 정보/계정 생성) 3스텝이 공유하는 헤더+카드+스텝 인디케이터 레이아웃. */
export function SignupStepShell({
  step,
  title,
  subtitle,
  track,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  track?: OrgTrack;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[720px]">
        <SignupStepIndicator currentStep={step} track={track} />
        <section className="mt-8 border border-[#dfe4ea] bg-white p-10 max-[560px]:p-6">
          <Eyebrow>기업회원 가입</Eyebrow>
          <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h1>
          <p className="mt-3 text-[14px] font-normal leading-[1.7] text-[#68717e]">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
