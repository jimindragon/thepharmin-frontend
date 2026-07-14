"use client";

import { X } from "lucide-react";
import { useRef } from "react";
import { FieldLabel } from "@/components/business/BusinessFormControls";

export type AttachmentItem = { name: string; size: number };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** 다중 파일 첨부 mock 위젯. 실제 업로드는 하지 않고 선택한 File의 이름·용량만 로컬 state로 관리한다. */
export function AttachmentUploader({
  label,
  description,
  accept,
  buttonLabel,
  emptyText,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  accept?: string;
  buttonLabel: string;
  emptyText: string;
  value: AttachmentItem[];
  onChange: (items: AttachmentItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({ name: file.name, size: file.size }));
    onChange([...value, ...next]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <FieldLabel className="block mb-1.5">
        {label}
        {description && <span className="ml-2 text-[12px] font-normal text-[#7b8491]">{description}</span>}
      </FieldLabel>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-12 items-center justify-center border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#4f5967] transition-colors hover:border-[#111111]"
      >
        {buttonLabel}
      </button>

      {value.length === 0 ? (
        <p className="mt-3 text-[11.5px] text-[#a0a9b7]">{emptyText}</p>
      ) : (
        <div className="mt-3 divide-y divide-[#eef0f3] border-t border-[#eef0f3]">
          {value.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="truncate text-[13px] font-medium text-[#303946]">{item.name}</span>
                <span className="shrink-0 text-[11.5px] text-[#8a94a3]">{formatFileSize(item.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`${item.name} 삭제`}
                className="shrink-0 text-[#8a94a3] transition-colors hover:text-[#111111]"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
