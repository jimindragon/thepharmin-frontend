"use client";

import clsx from "clsx";
import { Check } from "lucide-react";

/** 가입 진행 단계 표시기. 라벨·단계 수는 전부 호출부가 정한다(기업/개인 등 가입 종류를 여기서 알지 않는다). */
export function SignupStepIndicator({ currentStep, labels }: { currentStep: number; labels: readonly string[] }) {
  return (
    <ol className="flex items-center" aria-label="가입 진행 단계">
      {labels.map((label, index) => {
        const step = index + 1;
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center text-[13px] font-bold",
                  done && "bg-[#111111] text-white",
                  active && "border-2 border-[#111111] text-[#111111]",
                  !done && !active && "border border-[#d8e0e8] text-[#a0a9b7]",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={15} /> : step}
              </span>
              <span className={clsx("whitespace-nowrap text-[13px] font-medium", active || done ? "text-[#17202c]" : "text-[#a0a9b7]")}>
                {label}
              </span>
            </div>
            {step !== labels.length ? <span className={clsx("mx-4 h-px flex-1", done ? "bg-[#111111]" : "bg-[#e2e6ec]")} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
