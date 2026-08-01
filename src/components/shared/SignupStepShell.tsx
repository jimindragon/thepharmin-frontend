import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Typography";
import { SignupStepIndicator } from "@/components/shared/SignupStepIndicator";

/** 가입 스텝 화면이 공유하는 헤더+카드+스텝 인디케이터 레이아웃.
 * 스텝 라벨·Eyebrow는 전부 호출부가 정한다(가입 종류를 여기서 알지 않는다).
 * eyebrow/title/subtitle에 빈 문자열을 넘기면 그 요소를 렌더하지 않는다 — 완료 화면처럼
 * 헤더를 본문 안에서 직접 구성하는 스텝을 위한 장치다(값을 넘기는 호출부의 렌더는 그대로). */
export function SignupStepShell({
  step,
  labels,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  step: number;
  labels: readonly string[];
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f6f7] px-11 py-16 max-[760px]:px-5 max-[760px]:py-10">
      <div className="mx-auto max-w-[720px]">
        <SignupStepIndicator currentStep={step} labels={labels} />
        <section className="mt-8 border border-border bg-white p-10 max-[560px]:p-6">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {title ? <h1 className="mt-3 text-[28px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h1> : null}
          {subtitle ? <p className="mt-3 text-[15px] font-normal leading-[1.7] text-[#68717e]">{subtitle}</p> : null}
          <div className={eyebrow || title || subtitle ? "mt-8" : undefined}>{children}</div>
        </section>
      </div>
    </main>
  );
}
