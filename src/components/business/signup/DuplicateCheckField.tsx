"use client";

import { useState } from "react";
import { TextInput } from "@/components/business/BusinessFormControls";

/** 사업자등록번호/아이디 등 "중복 확인" 버튼이 붙는 입력. 목데이터 단계라 항상 사용 가능 처리한다. */
export function DuplicateCheckField({
  value,
  onChange,
  placeholder,
  availableMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  availableMessage: string;
}) {
  const [checkedValue, setCheckedValue] = useState<string | null>(null);
  const isChecked = checkedValue !== null && checkedValue === value && value.trim() !== "";

  return (
    <div>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={(next) => {
          onChange(next);
          if (checkedValue !== null && next !== checkedValue) setCheckedValue(null);
        }}
        right={
          <button
            type="button"
            disabled={!value.trim()}
            onClick={() => setCheckedValue(value)}
            className="ml-2 h-11 shrink-0 whitespace-nowrap border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#303946] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#c4cbd5] disabled:hover:border-[#d8e0e8]"
          >
            중복 확인
          </button>
        }
      />
      {isChecked ? <p className="mt-1.5 text-[12px] font-medium text-[#17a68c]">{availableMessage}</p> : null}
    </div>
  );
}
