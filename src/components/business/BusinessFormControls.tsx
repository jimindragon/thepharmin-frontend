"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

/** 기관정보 관리 폼의 텍스트형 필드(한 줄 소개·본문 소개·키워드 등) 공통 좌우 폭 기준.
 * 산업 트랙(BusinessCompanyProfileClient)에서 처음 도입 — 병원·약국·연구 트랙도 같은 값을 재사용한다. */
export const PROFILE_TEXT_FIELD_WIDTH = "max-w-[720px]";

/** TextInput의 실제 높이(h-11/44px) — 입력칸과 같은 행에 놓이는 버튼(FormActionButton)이 공유하는 기준값.
 * 위계는 이 높이를 줄이는 게 아니라 테두리·배경·폰트 크기로만 표현한다. */
export const CONTROL_HEIGHT = "h-11";

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

/** 필드 라벨 옆에 붙이는 ⓘ 설명 툴팁. hover/focus 시 설명 노출 — 병원 트랙 등에서 사용 예정 */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        role="button"
        aria-label={text}
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center text-[12px] font-normal leading-none text-[#9aa3af] outline-none transition hover:text-[#4f5967] focus-visible:text-[#4f5967]"
      >
        ⓘ
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[240px] -translate-x-1/2 border border-[#17202c] bg-[#17202c] px-3 py-2 text-[11.5px] font-normal leading-[1.5] text-white opacity-0 shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function FieldLabel({
  children,
  required = false,
  htmlFor,
  className,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={clsx("text-[14px] font-medium text-[#2f3845]", className)}>
      {children}
      {required ? (
        <span className="ml-1 text-danger" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  disabled,
  readOnly,
  placeholder,
  right,
}: {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** 값은 있지만 직접 타이핑은 막고 싶을 때(예: 우편번호 찾기로만 채워지는 필드). disabled와 동일한 시각 스타일을 쓰되 포커스/선택은 허용한다 */
  readOnly?: boolean;
  placeholder?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex">
      <input
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={clsx(
          "h-11 min-w-0 flex-1 border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8",
          (disabled || readOnly) && "bg-[#f5f6f7] text-[#7d8796]",
        )}
      />
      {right}
    </div>
  );
}

/** 입력칸과 같은 행에 놓이는 보조 버튼(우편번호 찾기·키워드/제품 추가·비밀번호 변경 등) 전용 컴포넌트.
 * 높이는 CONTROL_HEIGHT로 고정해 TextInput과 항상 나란히 맞고, 위계는 가는 테두리·배경 없음·작은 폰트로만 낮춘다. */
export function FormActionButton({
  onClick,
  children,
  disabled,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        CONTROL_HEIGHT,
        "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap border border-[#d8e0e8] bg-white px-3.5 text-[12px] font-medium text-[#4f5967] transition hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:border-[#e2e8ef] disabled:text-[#b7bfc9]",
        className,
      )}
    >
      {children}
    </button>
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
  title: ReactNode;
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
