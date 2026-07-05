"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={clsx(
            "h-10 border px-4 text-[13px] font-medium transition",
            value === option.id
              ? "border-[#111111] bg-[#f7f8fa] text-[#111111]"
              : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111] hover:text-[#111111]",
          )}
          aria-pressed={value === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ToggleChip({
  label,
  selected,
  onClick,
  auto = false,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** 유형에 따라 자동 매핑된 값임을 나타내는 표시(점선 테두리 + "자동" 태그) */
  auto?: boolean;
  /** 잠금 상태(해제 불가)일 때 클릭을 막는다 */
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "relative h-9 border px-3 text-[12px] font-medium transition",
        selected ? "border-[#111111] bg-[#f7f8fa] text-[#111111]" : "border-[#d8e0e8] bg-white text-[#4f5967] hover:border-[#111111]",
        auto && "border-dashed",
        disabled && "cursor-not-allowed",
      )}
      aria-pressed={selected}
    >
      {label}
      {auto ? (
        <span className="absolute -right-1.5 -top-2 bg-[#111111] px-1 py-0.5 text-[9px] font-medium leading-none text-white">자동</span>
      ) : null}
    </button>
  );
}

export function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="text-[14px] font-medium text-[#2f3845]">
      {children}
      {required ? <span className="ml-1 text-danger">*</span> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
  right,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex">
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={clsx(
          "h-11 min-w-0 flex-1 border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8",
          disabled && "bg-[#f5f6f7] text-[#7d8796]",
        )}
      />
      {right}
    </div>
  );
}

export function SectionCard({
  id,
  title,
  description,
  status,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[132px] border border-[#dfe4ea] bg-white p-6 shadow-[var(--shadow)] max-[760px]:p-4">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#1f2733]">{title}</h2>
          {description ? <p className="mt-2 text-[13px] font-normal leading-[1.65] text-[#7b8491]">{description}</p> : null}
        </div>
        {(status || action) ? (
          <div className="flex shrink-0 items-start gap-2 pt-0.5">
            {status ? (
              <span
                className={clsx(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium",
                  status === "완료" && "border-[#d7dde5] bg-[#f4f5f6] text-[#252d39]",
                  status === "작성 중" && "border-[#d7dde5] bg-white text-[#5f6876]",
                  status === "필수 입력 필요" && "border-status-error-border bg-status-error-subtle text-danger",
                  status === "선택 사항" && "border-[#d7dde5] bg-[#f8f9fa] text-[#7a8493]",
                )}
              >
                {status}
              </span>
            ) : null}
            {action ? <div>{action}</div> : null}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
