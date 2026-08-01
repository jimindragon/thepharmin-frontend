"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/business/BusinessFormControls";

/** 입력칸과 같은 행/블록에 붙는 보조 버튼. 기업 가입 폼의 인증·중복확인 버튼과 같은 스펙. */
const SIDE_BUTTON =
  "ml-2 h-11 shrink-0 whitespace-nowrap border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#c4cbd5] disabled:hover:border-[#d8e0e8]";

/**
 * 휴대폰 본인 확인 필드(개인 가입 전용).
 * 인증 완료 여부는 부모가 소유한다 — 번호가 바뀌면 부모가 isVerified를 내려주지 않는 방식으로 초기화한다.
 */
export function PhoneVerificationField({
  value,
  onChange,
  isVerified,
  onVerified,
}: {
  value: string;
  onChange: (v: string) => void;
  isVerified: boolean;
  onVerified: () => void;
}) {
  const [stage, setStage] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");

  const handleChange = (next: string) => {
    onChange(next.replace(/\D/g, ""));
    // 번호가 바뀌면 발송 단계도 되돌린다(부모는 isVerified를 함께 초기화한다).
    if (stage !== "idle") {
      setStage("idle");
      setCode("");
    }
  };

  return (
    <div className="space-y-2">
      <FieldLabel required>휴대폰 번호</FieldLabel>
      <TextInput
        value={value}
        disabled={isVerified}
        onChange={handleChange}
        placeholder="'-' 없이 숫자만 입력"
        right={
          <button
            type="button"
            disabled={!value.trim() || isVerified}
            onClick={() => setStage("sent")}
            className={SIDE_BUTTON}
          >
            인증번호 받기
          </button>
        }
      />

      {stage === "sent" && !isVerified ? (
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-[#5f6876]">인증번호가 발송되었습니다.</p>
          <div className="flex">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="인증번호 6자리 입력"
              className="h-11 min-w-0 flex-1 border border-[#d8e0e8] bg-white px-3.5 text-[15px] font-normal leading-tight text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
            />
            <button
              type="button"
              disabled={!code.trim()}
              onClick={() => {
                // 목업 — 실제 SMS 발송/코드 검증은 백엔드 연동 필요. 값이 비어있지 않으면 무조건 통과 처리한다.
                onVerified();
              }}
              className={SIDE_BUTTON}
            >
              확인
            </button>
          </div>
        </div>
      ) : null}

      {isVerified ? (
        <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-status-positive">
          <Check size={13} /> 인증 완료
        </p>
      ) : null}
    </div>
  );
}
