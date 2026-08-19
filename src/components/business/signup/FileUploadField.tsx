"use client";

import clsx from "clsx";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

/** 서명·증명원류 첨부 인풋. 목데이터 단계라 실제 업로드는 없고 선택한 파일명만 로컬로 표시한다. */
export function FileUploadField({
  label,
  hint,
  accept,
  onFileSelected,
  disabled,
}: {
  label: string;
  hint?: string;
  accept?: string;
  onFileSelected?: (fileName: string | null) => void;
  /** 더 이상 바꿀 수 없는 첨부(예: 인증이 끝난 면허증). 잠금 색은 TextInput의 disabled와 같은 값을 쓴다. */
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0]?.name ?? null;
          setFileName(next);
          onFileSelected?.(next);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={clsx(
          "flex min-h-[64px] w-full items-center gap-3 border border-dashed border-[#d8e0e8] px-4 text-left transition",
          disabled ? "cursor-not-allowed bg-[#f5f6f7] text-[#7d8796]" : "bg-[#fbfcfd] hover:border-[#111111]",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-white text-[#596373]">
          <Upload size={16} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-[#303946]">{fileName ?? label}</span>
          {hint ? <span className="mt-0.5 block truncate text-[12px] font-normal text-[#8a94a3]">{hint}</span> : null}
        </span>
      </button>
    </div>
  );
}
